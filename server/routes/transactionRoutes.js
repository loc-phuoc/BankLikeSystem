import { Router } from 'express';
import { deposit, withdraw, transfer } from '../controllers/transactionController.js';

const router = Router();

/**
 * @swagger
 * /deposit:
 *   post:
 *     summary: Deposit tokens to user
 *     description: Deposits tokens from bank to a user
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - amount
 *             properties:
 *               address:
 *                 type: string
 *                 description: User's blockchain address
 *               amount:
 *                 type: string
 *                 description: Amount of tokens to deposit
 *     responses:
 *       200:
 *         description: Deposit successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 100 BNK tokens deposited to user
 *                 transaction:
 *                   type: string
 *                   example: 0x1234...
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/deposit', deposit);

/**
 * @swagger
 * /withdraw:
 *   post:
 *     summary: Withdraw tokens
 *     description: Withdraws tokens from a user
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - amount
 *             properties:
 *               address:
 *                 type: string
 *                 description: User's blockchain address
 *               amount:
 *                 type: string
 *                 description: Amount of tokens to withdraw
 *               privateKey:
 *                 type: string
 *                 description: Private key for transaction signing
 *     responses:
 *       200:
 *         description: Withdrawal successful
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/withdraw', withdraw);

/**
 * @swagger
 * /transfer:
 *   post:
 *     summary: Transfer tokens
 *     description: Transfers tokens from one user to another
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromAddress
 *               - toAddress
 *               - amount
 *             properties:
 *               fromAddress:
 *                 type: string
 *                 description: Sender's blockchain address
 *               toAddress:
 *                 type: string
 *                 description: Recipient's blockchain address
 *               amount:
 *                 type: string
 *                 description: Amount of tokens to transfer
 *               privateKey:
 *                 type: string
 *                 description: Private key for transaction signing
 *     responses:
 *       200:
 *         description: Transfer successful
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Sender not found
 *       500:
 *         description: Server error
 */
router.post('/transfer', transfer);

/**
 * @swagger
 * /transactions/{address}:
 *   get:
 *     summary: Get transaction history
 *     description: Returns the transaction history of a blockchain address
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Blockchain address to get transactions for
 *     responses:
 *       200:
 *         description: Transaction history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   example: 0x123...
 *                 transactionCount:
 *                   type: number
 *                   example: 10
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [deposit, withdraw, transfer-in, transfer-out]
 *                       amount:
 *                         type: string
 *                         example: 50
 *                       txHash:
 *                         type: string
 *                         example: 0xabc...
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/transactions/:address', getTransactionHistory);

export default router;