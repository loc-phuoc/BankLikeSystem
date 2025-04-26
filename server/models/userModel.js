import { web3, bank } from '../config/blockchain.js';
import env from '../config/env.js';
import { getTokenBalance } from './tokenModel.js';
import User from '../schemas/userSchema.js';
import KeyUtil from '../utils/keyUtils.js';

export async function checkUserExists(address) {
    const userData = await bank.methods.users(address).call();
    return userData.exists;
}

export async function getUserDetails(address) {
    try {
        const userData = await bank.methods.users(address).call();

        if (!userData.exists) {
            return null;
        }

        const balance = await getTokenBalance(address);

        return {
            address,
            username: userData.username,
            email: userData.email,
            createdAt: new Date(Number(userData.createdAt) * 1000).toISOString(),
            balance: web3.utils.fromWei(balance, 'ether')
        };
    } catch (error) {
        console.error(`Failed to get details for ${address}:`, error.message);
        throw error;
    }
}

export async function getAllUsers() {
    try {
        const userCount = await bank.methods.getUserCount().call();
        const users = [];

        for (let i = 0; i < Number(userCount); i++) {
            const address = await bank.methods.userAddresses(i).call();
            const user = await getUserDetails(address);

            if (user) {
                users.push(user);
            }
        }

        return users;
    } catch (error) {
        console.error('Error getting all users:', error.message);
        throw error;
    }
}

export async function getUserByUsername(username) {
    try {
        const address = await bank.methods.usernameToAddress(username).call();

        if (address === '0x0000000000000000000000000000000000000000') {
            return null;
        }

        return getUserDetails(address);
    } catch (error) {
        console.error(`Failed to get user by username ${username}:`, error.message);
        throw error;
    }
}

export async function createUser(username, email = '') {
    try {
        // Create a new account
        const newAccount = web3.eth.accounts.create();

        // Add to wallet for signing
        web3.eth.accounts.wallet.add(newAccount.privateKey);

        // Fund with ETH for gas
        await web3.eth.sendTransaction({
            from: env.bankOwnerAddress,
            to: newAccount.address,
            value: web3.utils.toWei('0.1', 'ether'),
            gas: 21000,
            type: '0x0'
        });

        // Register user on blockchain
        await bank.methods.createUser(newAccount.address, username, email)
            .send({
                from: env.bankOwnerAddress,
                gas: env.defaultGas,
                type: '0x0'
            });
        
        const {dbShare, userShare1, userShare2, userShare3, encryptedPrivateKey} = KeyUtil.processPrivateKey(newAccount.privateKey);

        User.create({
            address: newAccount.address,
            username,
            email,
            encryptedPrivateKey: encryptedPrivateKey,
            dbShare: dbShare,
        });

        return {
            username,
            email,
            address: newAccount.address,
            shares: {
                userShare1,
                userShare2,
                userShare3
            }
        };
    } catch (error) {
        console.error('Error creating user:', error.message);
        throw error;
    }
}

export async function changeUsername(address, newUsername, sender) {
    await User.updateOne(
        { address: address },
        { username: newUsername },
        { new: true }
    );

    return bank.methods.changeUsername(address, newUsername)
        .send({
            from: sender,
            gas: env.defaultGas,
            type: '0x0'
        });
}

export async function changeEmail(address, newEmail, sender) {
    await User.updateOne(
        { address: address },
        { email: newEmail },
        { new: true }
    );
    return bank.methods.changeEmail(address, newEmail)
        .send({
            from: sender,
            gas: env.defaultGas,
            type: '0x0'
        });
}