import { getTokenBalance, getTokenInfo } from '../models/tokenModel.js';
import { web3 } from '../config/blockchain.js';

const TokenService = {
  async handleGetTokenInfo() {
    try {
      return await getTokenInfo();
    } catch (error) {
      console.error('Token info error:', error);
      throw { status: 500, message: `Failed to get token info: ${error.message}` };
    }
  },

  async handleGetBalance(address) {
    try {
      const balance = await getTokenBalance(address);
      return {
        address,
        balance: web3.utils.fromWei(balance, 'ether')
      };
    } catch (error) {
      console.error('Balance error:', error);
      throw { 
        status: 500, 
        message: `Failed to get balance: ${error.message}`,
        details: error.stack
      };
    }
  }
};

export default TokenService;