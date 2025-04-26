import { depositToUser, withdrawFromUser, getAccountTransactions } from '../models/bankModel.js';
import { getTokenBalance, approveSpender, transferTokens } from '../models/tokenModel.js';
import { checkUserExists } from '../models/userModel.js';
import { web3 } from '../config/blockchain.js';
import env from '../config/env.js';
import KeyUtil from '../utils/keyUtils.js';
import User from '../schemas/userSchema.js';

const TransactionService = {
    async handleDeposit(address, amount) {
        if (!address || !amount) throw { status: 400, message: 'Address and amount are required' };

        const exists = await checkUserExists(address);
        if (!exists) throw { status: 404, message: 'User not found' };

        const bankBalance = await getTokenBalance(env.bankAddress);
        const amountWei = web3.utils.toWei(amount.toString(), 'ether');
        if (web3.utils.toBigInt(bankBalance) < web3.utils.toBigInt(amountWei)) {
            throw { status: 400, message: 'Insufficient funds in bank', bankBalance: web3.utils.fromWei(bankBalance, 'ether') };
        }

        await depositToUser(address, amount);
        const newBalance = await getTokenBalance(address);

        return {
            success: true,
            message: `${amount} tokens deposited successfully`,
            address,
            amount,
            newBalance: web3.utils.fromWei(newBalance, 'ether')
        };
    },

    async handleWithdraw(address, amount, share) {
        if (!address || !amount || !share) throw { status: 400, message: 'Address, amount, and share are required' };

        const exists = await checkUserExists(address);
        if (!exists) throw { status: 404, message: 'User not found' };

        const userData = await User.findOne({ address });

        const privateKey = KeyUtil.reconstructPrivateKey(userData.dbShare, share, userData.encryptedPrivateKey);

        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        web3.eth.accounts.wallet.add(account);
        if (account.address.toLowerCase() !== address.toLowerCase()) {
            throw { status: 403, message: 'Private key does not match the user address' };
        }

        const userBalance = await getTokenBalance(address);
        const amountWei = web3.utils.toWei(amount.toString(), 'ether');
        if (web3.utils.toBigInt(userBalance) < web3.utils.toBigInt(amountWei)) {
            throw { status: 400, message: 'Insufficient funds', userBalance: web3.utils.fromWei(userBalance, 'ether') };
        }

        await approveSpender(address, env.bankAddress, amount);
        await withdrawFromUser(address, amount);
        const newBalance = await getTokenBalance(address);

        return {
            success: true,
            message: `${amount} tokens withdrawn successfully`,
            address,
            amount,
            newBalance: web3.utils.fromWei(newBalance, 'ether')
        };
    },

    async handleTransfer(fromAddress, toAddress, amount, share) {
        if (!fromAddress || !toAddress || !amount || !share) throw { status: 400, message: 'From address, to address, amount, and share are required' };

        const exists = await checkUserExists(fromAddress);
        if (!exists) throw { status: 404, message: 'Sender not found' };

        const userData = await User.findOne({ address: fromAddress });

        const privateKey = KeyUtil.reconstructPrivateKey(userData.dbShare, share, userData.encryptedPrivateKey);

        const account = web3.eth.accounts.privateKeyToAccount(privateKey);

        web3.eth.accounts.wallet.add(account);
        if (account.address.toLowerCase() !== fromAddress.toLowerCase()) {
            throw { status: 403, message: 'Private key does not match the sender address' };
        }

        const senderBalance = await getTokenBalance(fromAddress);
        const amountWei = web3.utils.toWei(amount.toString(), 'ether');
        if (web3.utils.toBigInt(senderBalance) < web3.utils.toBigInt(amountWei)) {
            throw { status: 400, message: 'Insufficient funds', senderBalance: web3.utils.fromWei(senderBalance, 'ether') };
        }

        await transferTokens(fromAddress, toAddress, amount);

        const newSenderBalance = await getTokenBalance(fromAddress);
        const newReceiverBalance = await getTokenBalance(toAddress);

        return {
            success: true,
            message: `${amount} tokens transferred successfully`,
            from: fromAddress,
            to: toAddress,
            amount,
            newSenderBalance: web3.utils.fromWei(newSenderBalance, 'ether'),
            newReceiverBalance: web3.utils.fromWei(newReceiverBalance, 'ether')
        };
    },

    async handleGetTransactionHistory(address) {
        if (!address) throw { status: 400, message: 'Address is required' };

        const transactions = await getAccountTransactions(address);
        return {
            address,
            transactionCount: transactions.length,
            transactions
        };
    }
};

export default TransactionService;