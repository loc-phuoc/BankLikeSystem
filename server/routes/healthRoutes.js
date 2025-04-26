import { Router } from 'express';
import { getHealthStatus, fundBankFromOwner } from '../controllers/healthController.js';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get system health status
 *     description: Returns the health status of the blockchain system
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 bank:
 *                   type: object
 *                   properties:
 *                     address:
 *                       type: string
 *                       example: 0xeA8edd1E9E8fCD0baF88329e1c4B7b3F01f23143
 *                     owner:
 *                       type: string
 *                       example: 0xf4A62a27C373B22d268e567A0C7D864fE648ab19
 *                 token:
 *                   type: object
 *                   properties:
 *                     address:
 *                       type: string
 *                       example: 0xc570330dd72829e1b475d94F0E9c0dF48A784930
 *                     name:
 *                       type: string
 *                       example: Bank Token
 *                     symbol:
 *                       type: string
 *                       example: BNK
 */
router.get('/health', getHealthStatus);

/**
 * @swagger
 * /health/fund:
 *   get:
 *     summary: Fund bank contract with tokens
 *     description: Transfers tokens from the bank owner address to the bank contract
 *     tags: [System]
 *     parameters:
 *       - in: query
 *         name: amount
 *         schema:
 *           type: string
 *         description: Amount of tokens to transfer (optional, defaults to 1000)
 *     responses:
 *       200:
 *         description: Funding successful
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
 *                   example: Successfully funded bank contract with 1000 BNK
 *                 transaction:
 *                   type: string
 *                   example: 0x1234...abcd
 *                 bankBalance:
 *                   type: string
 *                   example: 5000.0
 *       500:
 *         description: Funding failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Failed to fund bank contract
 */
router.get('/health/fund', fundBankFromOwner);

export default router;