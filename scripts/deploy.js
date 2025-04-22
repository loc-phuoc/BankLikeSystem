const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get the BankToken contract
  const BankToken = await hre.ethers.getContractFactory("BankToken");
  const bankToken = await BankToken.deploy("1000000000000000000000000");
  await bankToken.deployed();
  console.log("BankToken deployed at:", bankToken.address);

  // Get the Bank contract and deploy with token address
  const Bank = await hre.ethers.getContractFactory("Bank");
  const bank = await Bank.deploy(bankToken.address);
  await bank.deployed();
  console.log("Bank deployed at:", bank.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
