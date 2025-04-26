// --- controllers/transactionController.js ---
import TransactionService from '../services/transactionService.js';

export async function deposit(req, res) {
  try {
    const { address, amount } = req.body;
    const result = await TransactionService.handleDeposit(address, amount);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export async function transfer(req, res) {
  try {
    const { fromAddress, toAddress, amount, share } = req.body;
    const result = await TransactionService.handleTransfer(fromAddress, toAddress, amount, share);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export async function withdraw(req, res) {
  try {
    const { address, amount, share } = req.body;
    const result = await TransactionService.handleWithdraw(address, amount, share);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export async function getTransactionHistory(req, res) {
  try {
    const { address } = req.params;
    const transactions = await TransactionService.handleGetTransactionHistory(address);
    res.json(transactions);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}
