import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(
    deployer.address
  );

  console.log(
    "Deployer BNB:",
    ethers.formatEther(balance)
  );

  /*
   * Initial supplies.
   *
   * TRADEUSD:
   * 1,000,000 tokens
   *
   * TRADE:
   * 10,000,000,000 tokens
   */

  const tradeUSDFactory =
    await ethers.getContractFactory("TradeUSD");

  const tradeUSD = await tradeUSDFactory.deploy(
    deployer.address,
    ethers.parseUnits("1000000", 6)
  );

  await tradeUSD.waitForDeployment();

  const tradeUSDAddress =
    await tradeUSD.getAddress();

  console.log(
    "TRADEUSD:",
    tradeUSDAddress
  );

  const tradeFactory =
    await ethers.getContractFactory("TradeToken");

  const trade = await tradeFactory.deploy(
    deployer.address,
    ethers.parseUnits("10000000000", 18)
  );

  await trade.waitForDeployment();

  const tradeAddress =
    await trade.getAddress();

  console.log(
    "TRADE:",
    tradeAddress
  );

  console.log("");
  console.log("Do NOT add these to .env.local until");
  console.log("the deployment has been independently checked.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
