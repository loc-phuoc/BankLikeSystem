import { web3, bank } from '../config/blockchain.js';
import env from '../config/env.js';

export async function getBankOwner() {
    return bank.methods.owner().call();
}

export async function depositToUser(userAddress, amount) {
    const amountWei = web3.utils.toWei(amount.toString(), 'ether');

    return bank.methods.deposit(userAddress, amountWei)
        .send({
            from: env.bankOwnerAddress,
            gas: env.defaultGas,
            type: '0x0'
        });
}

export async function withdrawFromUser(userAddress, amount) {
    const amountWei = web3.utils.toWei(amount.toString(), 'ether');

    return bank.methods.withdraw(amountWei)
        .send({
            from: userAddress,
            gas: env.defaultGas,
            type: '0x0'
        });
}

export async function getAccountTransactions(address) {
    try {
      // Get deposit events where user is recipient
      const depositEvents = await bank.getPastEvents('TokensDeposited', {
        filter: { to: address },
        fromBlock: 0,
        toBlock: 'latest'
      });
      
      // Get withdrawal events where user is sender
      const withdrawEvents = await bank.getPastEvents('TokensWithdrawn', {
        filter: { from: address },
        fromBlock: 0,
        toBlock: 'latest'
      });
      
      // Format deposit events
      const deposits = depositEvents.map(event => ({
        type: 'deposit',
        amount: web3.utils.fromWei(event.returnValues.amount, 'ether'),
        txHash: event.transactionHash,
        timestamp: new Date(Number(event.returnValues.timestamp) * 1000).toISOString(),
        blockNumber: event.blockNumber
      }));
      
      // Format withdraw events
      const withdrawals = withdrawEvents.map(event => ({
        type: 'withdraw',
        amount: web3.utils.fromWei(event.returnValues.amount, 'ether'),
        txHash: event.transactionHash,
        timestamp: new Date(Number(event.returnValues.timestamp) * 1000).toISOString(),
        blockNumber: event.blockNumber
      }));
      
      // Get token transfers (both sent and received)
      const sentTransfers = await token.getPastEvents('Transfer', {
        filter: { from: address },
        fromBlock: 0,
        toBlock: 'latest'
      });
      
      const receivedTransfers = await token.getPastEvents('Transfer', {
        filter: { to: address },
        fromBlock: 0,
        toBlock: 'latest'
      });
      
      // Filter out deposits and withdrawals which are also transfers
      // to avoid duplicates
      const bankDepositTxHashes = deposits.map(d => d.txHash);
      const bankWithdrawalTxHashes = withdrawals.map(w => w.txHash);
      
      // Format transfer events
      const outgoingTransfers = sentTransfers
        .filter(event => !bankWithdrawalTxHashes.includes(event.transactionHash))
        .filter(event => event.returnValues.to !== env.bankAddress)  // Exclude transfers to bank
        .map(event => ({
          type: 'transfer-out',
          to: event.returnValues.to,
          amount: web3.utils.fromWei(event.returnValues.value, 'ether'),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          // Use block timestamp since Transfer events don't have timestamps
          timestamp: null  // Will be filled in below
        }));
      
      const incomingTransfers = receivedTransfers
        .filter(event => !bankDepositTxHashes.includes(event.transactionHash))
        .filter(event => event.returnValues.from !== env.bankAddress)  // Exclude transfers from bank
        .map(event => ({
          type: 'transfer-in',
          from: event.returnValues.from,
          amount: web3.utils.fromWei(event.returnValues.value, 'ether'),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: null  // Will be filled in below
        }));
      
      // Get timestamps for transfers (requires additional blockchain calls)
      const allTransfers = [...outgoingTransfers, ...incomingTransfers];
      
      // Get block timestamps for transfers (batch operation)
      const uniqueBlockNumbers = [...new Set(allTransfers.map(tx => tx.blockNumber))];
      const blocks = await Promise.all(
        uniqueBlockNumbers.map(blockNumber => web3.eth.getBlock(blockNumber))
      );
      
      // Create mapping of block number to timestamp
      const blockTimestamps = {};
      blocks.forEach(block => {
        blockTimestamps[block.number] = new Date(block.timestamp * 1000).toISOString();
      });
      
      // Fill in timestamps
      allTransfers.forEach(tx => {
        tx.timestamp = blockTimestamps[tx.blockNumber];
      });
      
      // Combine all transactions and sort by timestamp (newest first)
      const allTransactions = [...deposits, ...withdrawals, ...outgoingTransfers, ...incomingTransfers]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return allTransactions;
    } catch (error) {
      console.error('Error getting transaction history:', error.message);
      throw error;
    }
  }