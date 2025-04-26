// --- controllers/tokenController.js ---
import TokenService from '../services/tokenService.js';

export async function getToken(req, res) {
  try {
    const tokenInfo = await TokenService.handleGetTokenInfo();
    res.json(tokenInfo);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export async function getBalance(req, res) {
  try {
    const { address } = req.params;
    const balanceInfo = await TokenService.handleGetBalance(address);
    res.json(balanceInfo);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}