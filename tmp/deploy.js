// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // Get the first signer (deployer) provided by Hardhat
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Make sure the deployer has enough balance (for gas costs)
  // const balance = await deployer.getBalance();
  // console.log("Deployer account balance:", hre.ethers.utils.formatEther(balance), "ETH");

  // Compile contracts (if not already compiled)
  await hre.run("compile");

  // Get the contract factory and deploy
  const ContractFactory = await hre.ethers.getContractFactory("BankToken");  // replace with your contract name
  const BankFactory = await hre.ethers.getContractFactory("Bank");

  const contract = await ContractFactory.deploy("1000000000000000000000000");
  // Wait for the deployment transaction to be mined
  const token = await contract.deployed();
  console.log("MyContract deployed at address:", token.address);
  const bank = await BankFactory.deploy(token.address);
  // Wait for the deployment transaction to be mined
  const bankContract = await bank.deployed();

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
