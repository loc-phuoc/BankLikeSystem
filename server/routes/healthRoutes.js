import { Router } from 'express';
import { getHealthStatus } from '../controllers/healthController.js';

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

export default router;