import Web3 from 'web3';
import { createRequire } from 'module';
import env from './env.js';

const require = createRequire(import.meta.url);

// Import contract ABIs
const BankABI = require('../../artifacts/contracts/Bank.sol/Bank.json').abi;
const BankTokenABI = require('../../artifacts/contracts/BankToken.sol/BankToken.json').abi;

// Initialize web3 with EIP-1559 disabled
const web3 = new Web3(env.rpcUrl, {
  transactionType: '0x0' // Force legacy transactions
});

// Initialize contract instances
const bank = new web3.eth.Contract(BankABI, env.bankAddress);
const token = new web3.eth.Contract(BankTokenABI, env.tokenAddress);

// Add bank owner to wallet if private key is available
if (env.bankOwnerPrivateKey) {
  web3.eth.accounts.wallet.add(env.bankOwnerPrivateKey);
  console.log('Bank owner added to wallet');
}

export { web3, bank, token };