import { getBankOwner } from '../models/bankModel.js';
import { getTokenInfo } from '../models/tokenModel.js';
import env from '../config/env.js';
import { token, web3 } from '../config/blockchain.js';

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

export async function fundBankFromOwner(req, res) {
  try {
    await token.methods.transfer(env.bankAddress, web3.utils.toWei('1000000', 'ether'))
      .send({
        from: env.bankOwnerAddress,
        gas: env.defaultGas,
        type: '0x0'
      });
    res.json({ success: true, message: `${amount} tokens transferred to the bank` });
  } catch (error) {
    console.error('Failed to fund bank:', error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
}