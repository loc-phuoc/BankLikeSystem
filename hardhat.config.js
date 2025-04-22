/** hardhat.config.js */
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      // Hardhat's built-in network (default) - leave as is or specify settings if needed
    },
    localPoA: {
      url: process.env.RPC_URL | "http://47.130.33.154:8545",       // RPC URL of your Geth node
      chainId: process.env.CHAIN_ID | 4242,                     // replace with your network's chain ID
      gas: process.env.DEFAULT_GAS | 8000000,
      gasPrice: process.env.GAS_PRICE | 0   // deployer account private key (hex string)
    }
  }
};
