import { getTokenInfo as getTokenInfoModel, getTokenBalance } from '../models/tokenModel.js';

export async function getToken(req, res) {
  try {
    const tokenInfo = await getTokenInfoModel();
    res.json(tokenInfo);
  } catch (error) {
    console.error('Error getting token info:', error.message);
    res.status(500).json({ error: 'Failed to get token information' });
  }
}

export async function getBalance(req, res) {
  try {
    const { address } = req.params;
    
    const balance = await getTokenBalance(address);
    
    res.json({
      address,
      balance: req.web3.utils.fromWei(balance, 'ether')
    });
  } catch (error) {
    console.error('Error getting balance:', error.message);
    res.status(500).json({ error: 'Failed to get token balance' });
  }
}