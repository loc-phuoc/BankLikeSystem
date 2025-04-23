import { web3 } from '../config/blockchain.js';

export function weiToEther(wei) {
  return web3.utils.fromWei(wei, 'ether');
}

export function etherToWei(ether) {
  return web3.utils.toWei(ether.toString(), 'ether');
}

export function createAccount() {
  return web3.eth.accounts.create();
}