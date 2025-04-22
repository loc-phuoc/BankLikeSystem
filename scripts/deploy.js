const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get the BankToken contract
  const BankToken = await hre.ethers.getContractFactory("BankToken");
  const bankToken = await BankToken.deploy("1000000000000000000000000");
  console.log("BankToken deployed at:", bankToken.target);

  // Get the Bank contract and deploy with token address
  const Bank = await hre.ethers.getContractFactory("Bank");
  const bank = await Bank.deploy(bankToken.target);
  console.log("Bank deployed at:", bank.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})