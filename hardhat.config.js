/** hardhat.config.js */
require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      // Hardhat's built-in network (default) - leave as is or specify settings if needed
    },
    localPoA: {
      url: "http://47.130.33.154:8545",       // RPC URL of your Geth node
      chainId: 4242,                     // replace with your network's chain ID
      gas: 8000000,
      gasPrice: 0   // deployer account private key (hex string)
    }
  }
};
