import { Router } from 'express';
import { getToken, getBalance } from '../controllers/tokenController.js';

const router = Router();

/**
 * @swagger
 * /token:
 *   get:
 *     summary: Get token information
 *     description: Returns details about the ERC20 token used by the bank
 *     tags: [Token]
 *     responses:
 *       200:
 *         description: Token information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Token'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/token', getToken);

/**
 * @swagger
 * /balance/{address}:
 *   get:
 *     summary: Get token balance for an address
 *     description: Returns the token balance for a specific blockchain address
 *     tags: [Token]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Blockchain address to check balance for
 *     responses:
 *       200:
 *         description: Token balance information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                   example: 0x123...
 *                 balance:
 *                   type: string
 *                   example: 100.5
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/balance/:address', getBalance);

export default router;