require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  networks: {
    hardhat: {},

    bscTestnet: {
      url:
        process.env.BSC_TESTNET_RPC_URL ||
        "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
      chainId: 97,

      accounts: process.env.BSC_TESTNET_PRIVATE_KEY
        ? [process.env.BSC_TESTNET_PRIVATE_KEY]
        : []
    },

    bscMainnet: {
      url:
        process.env.BSC_RPC_URL ||
        "https://bsc-dataseed.bnbchain.org",
      chainId: 56,

      accounts: process.env.BSC_PRIVATE_KEY
        ? [process.env.BSC_PRIVATE_KEY]
        : []
    }
  }
};
