const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config();

const ROOT = process.cwd();

function loadArtifact(name) {
  const file = path.join(
    ROOT,
    "artifacts",
    "contracts",
    "contracts",
    `${name}.json`
  );

  if (!fs.existsSync(file)) {
    throw new Error(
      `Missing artifact:\n${file}\n\nRun:\npnpm run compile`
    );
  }

  const artifact = JSON.parse(fs.readFileSync(file, "utf8"));

  if (!artifact.bytecode || artifact.bytecode === "0x") {
    throw new Error(`${name} has empty bytecode.`);
  }

  return artifact;
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value.trim();
}

const NETWORK = (
  process.env.DEPLOY_NETWORK ||
  process.env.NETWORK ||
  "bscTestnet"
).toLowerCase();

const IS_MAINNET =
  NETWORK === "bscmainnet" ||
  NETWORK === "mainnet";

const CHAIN_ID = IS_MAINNET ? 56 : 97;

const RPC_URLS = IS_MAINNET
  ? [
      process.env.BSC_RPC_URL,
      "https://bsc-dataseed.bnbchain.org",
      "https://bsc-dataseed1.bnbchain.org",
      "https://bsc-dataseed2.bnbchain.org",
      "https://bsc-dataseed3.bnbchain.org",
      "https://bsc-dataseed4.bnbchain.org",
      "https://bsc.publicnode.com"
    ]
  : [
      process.env.BSC_TESTNET_RPC_URL,
      "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
      "https://data-seed-prebsc-2-s1.bnbchain.org:8545",
      "https://bsc-testnet-rpc.publicnode.com"
    ];

const RPCS = [...new Set(RPC_URLS.filter(Boolean))];

function createProvider(rpc) {
  return new ethers.JsonRpcProvider(
    rpc,
    {
      name: IS_MAINNET ? "bsc" : "bsc-testnet",
      chainId: CHAIN_ID
    },
    {
      staticNetwork: true,
      batchMaxCount: 1,
      polling: true,
      pollingInterval: 4000,
      timeout: 15000
    }
  );
}

async function connectProvider() {
  console.log("");
  console.log("========================================");
  console.log("BSC RPC CONNECTIVITY TEST");
  console.log("========================================");

  for (const rpc of RPCS) {
    let provider;

    try {
      console.log("");
      console.log("Trying:", rpc);

      provider = createProvider(rpc);

      const network = await provider.getNetwork();

      if (Number(network.chainId) !== CHAIN_ID) {
        console.log(
          `✗ Wrong chain: ${network.chainId}. Expected ${CHAIN_ID}`
        );

        await provider.destroy();
        continue;
      }

      const block = await provider.getBlockNumber();

      console.log("✓ RPC OK");
      console.log("  Chain ID:", Number(network.chainId));
      console.log("  Block:", block);

      return {
        provider,
        rpc
      };
    } catch (error) {
      console.log(
        "✗ Failed:",
        error.shortMessage || error.message || error
      );

      if (provider) {
        try {
          await provider.destroy();
        } catch {}
      }
    }
  }

  throw new Error(
    "All BSC RPC endpoints failed."
  );
}

async function waitForReceipt(provider, txHash) {
  console.log("");
  console.log("Transaction:", txHash);
  console.log("Waiting for confirmation...");

  for (let i = 0; i < 60; i++) {
    try {
      const receipt =
        await provider.getTransactionReceipt(txHash);

      if (receipt) {
        if (receipt.status !== 1) {
          throw new Error(
            `Transaction reverted: ${txHash}`
          );
        }

        console.log(
          `✓ Confirmed in block ${receipt.blockNumber}`
        );

        return receipt;
      }
    } catch (error) {
      if (
        error.message &&
        error.message.toLowerCase().includes("revert")
      ) {
        throw error;
      }
    }

    await new Promise(resolve =>
      setTimeout(resolve, 3000)
    );
  }

  throw new Error(
    `Timed out waiting for confirmation: ${txHash}`
  );
}

async function deployContract(
  wallet,
  artifact,
  args,
  name
) {
  console.log("");
  console.log("========================================");
  console.log(`DEPLOYING ${name}`);
  console.log("========================================");

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  console.log("Building deployment transaction...");

  const deployTx =
    await factory.getDeployTransaction(...args);

  console.log("Estimating gas...");

  let gasEstimate;

  try {
    gasEstimate =
      await wallet.estimateGas(deployTx);
  } catch (error) {
    throw new Error(
      `Gas estimation failed for ${name}:\n` +
      `${error.shortMessage || error.message || error}`
    );
  }

  console.log(
    "Estimated gas:",
    gasEstimate.toString()
  );

  const gasLimit =
    gasEstimate * 120n / 100n;

  console.log(
    "Gas limit:",
    gasLimit.toString()
  );

  console.log("Sending transaction...");

  const contract =
    await factory.deploy(
      ...args,
      {
        gasLimit
      }
    );

  const tx =
    contract.deploymentTransaction();

  if (!tx) {
    throw new Error(
      `No deployment transaction returned for ${name}.`
    );
  }

  console.log("Transaction:", tx.hash);

  const receipt =
    await waitForReceipt(
      wallet.provider,
      tx.hash
    );

  await contract.waitForDeployment();

  const address =
    await contract.getAddress();

  console.log("✓ Contract:", address);

  return {
    address,
    txHash: tx.hash,
    blockNumber: receipt.blockNumber
  };
}

async function main() {
  console.log("");
  console.log("========================================");
  console.log("TRADEDEX PORTABLE DEPLOYER");
  console.log("========================================");

  console.log(
    "Network:",
    IS_MAINNET
      ? "BSC MAINNET"
      : "BSC TESTNET"
  );

  console.log(
    "Chain ID:",
    CHAIN_ID
  );

  const privateKey =
    IS_MAINNET
      ? requireEnv("BSC_PRIVATE_KEY")
      : requireEnv("BSC_TESTNET_PRIVATE_KEY");

  const connection =
    await connectProvider();

  const provider =
    connection.provider;

  const wallet =
    new ethers.Wallet(
      privateKey,
      provider
    );

  console.log("");
  console.log("========================================");
  console.log("DEPLOYER");
  console.log("========================================");

  console.log(
    "Address:",
    wallet.address
  );

  const balance =
    await provider.getBalance(
      wallet.address
    );

  console.log(
    "BNB:",
    ethers.formatEther(balance)
  );

  if (balance === 0n) {
    throw new Error(
      "Deployer wallet has zero BNB."
    );
  }

  console.log("");
  console.log("Checking network state...");

  const block =
    await provider.getBlockNumber();

  console.log(
    "Current block:",
    block
  );

  const fee =
    await provider.getFeeData();

  console.log(
    "Gas price:",
    fee.gasPrice
      ? ethers.formatUnits(
          fee.gasPrice,
          "gwei"
        ) + " gwei"
      : "unavailable"
  );

  const tradeUSDArtifact =
    loadArtifact("TradeUSD");

  const tradeArtifact =
    loadArtifact("TradeToken");

  console.log("");
  console.log("========================================");
  console.log("ARTIFACTS");
  console.log("========================================");

  console.log("✓ TradeUSD");
  console.log("✓ TradeToken");

  /*
   * TradeUSD
   * 6 decimals
   * 1,000,000 TRADEUSD
   */
  const tradeUSDSupply =
    ethers.parseUnits(
      "1000000",
      6
    );

  /*
   * TRADE
   * 18 decimals
   * 10,000,000,000 TRADE
   */
  const tradeSupply =
    ethers.parseUnits(
      "10000000000",
      18
    );

  const tradeUSD =
    await deployContract(
      wallet,
      tradeUSDArtifact,
      [
        wallet.address,
        tradeUSDSupply
      ],
      "TRADEUSD"
    );

  const trade =
    await deployContract(
      wallet,
      tradeArtifact,
      [
        wallet.address,
        tradeSupply
      ],
      "TRADE"
    );

  console.log("");
  console.log("========================================");
  console.log("DEPLOYMENT SUCCESSFUL");
  console.log("========================================");

  console.log(
    "Network:",
    IS_MAINNET
      ? "BSC Mainnet"
      : "BSC Testnet"
  );

  console.log(
    "Chain ID:",
    CHAIN_ID
  );

  console.log(
    "RPC:",
    connection.rpc
  );

  console.log(
    "Deployer:",
    wallet.address
  );

  console.log("");
  console.log(
    "TRADEUSD:",
    tradeUSD.address
  );

  console.log(
    "TRADE:",
    trade.address
  );

  console.log("");
  console.log(
    "Save these addresses securely."
  );

  await provider.destroy();
}

main().catch(async error => {
  console.error("");
  console.error("========================================");
  console.error("DEPLOYMENT FAILED");
  console.error("========================================");
  console.error("");
  console.error(
    error.shortMessage ||
    error.message ||
    error
  );
  process.exit(1);
});
