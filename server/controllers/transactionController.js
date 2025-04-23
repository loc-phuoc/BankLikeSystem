import { web3 } from '../config/blockchain.js';
import env from '../config/env.js';
import { getTokenBalance, transferTokens, approveSpender } from '../models/tokenModel.js';
import { depositToUser, withdrawFromUser } from '../models/bankModel.js';
import { checkUserExists } from '../models/userModel.js';

export async function deposit(req, res) {
  try {
    const { address, amount } = req.body;
    
    if (!address || !amount) {
      return res.status(400).json({ error: 'Address and amount are required' });
    }
    
    // Verify user exists
    const exists = await checkUserExists(address);
    if (!exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Convert amount to wei
    const amountWei = web3.utils.toWei(amount.toString(), 'ether');
    
    // Check bank contract balance
    const bankBalance = await getTokenBalance(env.bankAddress);
    if (web3.utils.toBigInt(bankBalance) < web3.utils.toBigInt(amountWei)) {
      return res.status(400).json({ 
        error: 'Insufficient funds in bank',
        bankBalance: web3.utils.fromWei(bankBalance, 'ether')
      });
    }
    
    // Perform deposit
    await depositToUser(address, amount);
    
    // Get new balance
    const newBalance = await getTokenBalance(address);
    
    res.json({
      success: true,
      message: `${amount} tokens deposited successfully`,
      address,
      amount,
      newBalance: web3.utils.fromWei(newBalance, 'ether')
    });
  } catch (error) {
    console.error('Error during deposit:', error.message);
    res.status(500).json({ error: 'Failed to deposit tokens' });
  }
}

export async function withdraw(req, res) {
  try {
    const { address, amount, privateKey } = req.body;
    
    if (!address || !amount || !privateKey) {
      return res.status(400).json({ error: 'Address, amount, and privateKey are required' });
    }
    
    // Verify user exists
    const exists = await checkUserExists(address);
    if (!exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Add the private key to the wallet
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    
    // Verify the sender matches the address
    if (account.address.toLowerCase() !== address.toLowerCase()) {
      return res.status(403).json({ error: 'Private key does not match the user address' });
    }
    
    // Convert amount to wei
    const amountWei = web3.utils.toWei(amount.toString(), 'ether');
    
    // Check user balance
    const userBalance = await getTokenBalance(address);
    if (web3.utils.toBigInt(userBalance) < web3.utils.toBigInt(amountWei)) {
      return res.status(400).json({ 
        error: 'Insufficient funds',
        userBalance: web3.utils.fromWei(userBalance, 'ether')
      });
    }
    
    // Approve bank to spend tokens
    await approveSpender(address, env.bankAddress, amount);
    
    // Perform withdrawal
    await withdrawFromUser(address, amount);
    
    // Get new balance
    const newBalance = await getTokenBalance(address);
    
    res.json({
      success: true,
      message: `${amount} tokens withdrawn successfully`,
      address,
      amount,
      newBalance: web3.utils.fromWei(newBalance, 'ether')
    });
  } catch (error) {
    console.error('Error during withdrawal:', error.message);
    res.status(500).json({ error: 'Failed to withdraw tokens' });
  }
}

export async function transfer(req, res) {
  try {
    const { fromAddress, toAddress, amount, privateKey } = req.body;
    
    if (!fromAddress || !toAddress || !amount || !privateKey) {
      return res.status(400).json({ error: 'From address, to address, amount, and privateKey are required' });
    }
    
    // Verify fromAddress user exists
    const fromExists = await checkUserExists(fromAddress);
    if (!fromExists) {
      return res.status(404).json({ error: 'Sender not found' });
    }
    
    // Add the private key to the wallet
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    
    // Verify the sender matches the fromAddress
    if (account.address.toLowerCase() !== fromAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Private key does not match the sender address' });
    }
    
    // Check sender balance
    const senderBalance = await getTokenBalance(fromAddress);
    if (web3.utils.toBigInt(senderBalance) < web3.utils.toBigInt(web3.utils.toWei(amount.toString(), 'ether'))) {
      return res.status(400).json({ 
        error: 'Insufficient funds',
        senderBalance: web3.utils.fromWei(senderBalance, 'ether')
      });
    }
    
    // Perform transfer
    await transferTokens(fromAddress, toAddress, amount);
    
    // Get new balances
    const newSenderBalance = await getTokenBalance(fromAddress);
    const newReceiverBalance = await getTokenBalance(toAddress);
    
    res.json({
      success: true,
      message: `${amount} tokens transferred successfully`,
      from: fromAddress,
      to: toAddress,
      amount,
      newSenderBalance: web3.utils.fromWei(newSenderBalance, 'ether'),
      newReceiverBalance: web3.utils.fromWei(newReceiverBalance, 'ether')
    });
  } catch (error) {
    console.error('Error during transfer:', error.message);
    res.status(500).json({ error: 'Failed to transfer tokens' });
  }
}