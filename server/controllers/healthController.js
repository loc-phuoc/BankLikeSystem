import { getBankOwner } from '../models/bankModel.js';
import { getTokenInfo } from '../models/tokenModel.js';
import env from '../config/env.js';

export async function getHealthStatus(req, res) {
  try {
    const owner = await getBankOwner();
    const tokenInfo = await getTokenInfo();
    
    res.json({
      status: 'ok',
      bank: {
        address: env.bankAddress,
        owner: owner
      },
      token: {
        address: env.tokenAddress,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol
      }
    });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(500).json({ error: 'Failed to check system health' });
  }
}