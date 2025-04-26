import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT,
  rpcUrl: process.env.RPC_URL,
  bankOwnerAddress: process.env.BANK_OWNER_ADDRESS,
  bankAddress: process.env.BANK_ADDRESS,
  tokenAddress: process.env.TOKEN_ADDRESS,
  defaultGas: parseInt(process.env.DEFAULT_GAS || '300000'),
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/blockchain-bank'
};