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
      url: process.env.RPC_URL,        // RPC URL of your Geth node
      chainId: 4242,   // replace with your network's chain ID
      gas: 300000,                     // gas limit for transactions
      gasPrice: 0                      // deployer account private key (hex string)
    }
  }
};
