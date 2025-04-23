import { web3, token } from '../config/blockchain.js';

export async function getTokenBalance(address) {
    try {
        const balance = await token.methods.balanceOf(address).call();
        return balance;
    } catch (error) {
        console.error(`Failed to get balance for ${address}:`, error.message);
        throw error;
    }
}

export async function getTokenInfo() {
    try {
        const name = await token.methods.name().call();
        const symbol = await token.methods.symbol().call();
        const decimals = await token.methods.decimals().call();
        const totalSupply = await token.methods.totalSupply().call();

        return {
            name,
            symbol,
            decimals: Number(decimals),
            totalSupply: web3.utils.fromWei(totalSupply, 'ether'),
            address: token.options.address
        };
    } catch (error) {
        console.error('Error getting token info:', error.message);
        throw error;
    }
}

export async function transferTokens(fromAddress, toAddress, amount) {
    const amountWei = web3.utils.toWei(amount.toString(), 'ether');

    return token.methods.transfer(toAddress, amountWei)
        .send({
            from: fromAddress,
            gas: 200000,
            type: '0x0'
        });
}

export async function approveSpender(ownerAddress, spenderAddress, amount) {
    const amountWei = web3.utils.toWei(amount.toString(), 'ether');

    return token.methods.approve(spenderAddress, amountWei)
        .send({
            from: ownerAddress,
            gas: 200000,
            type: '0x0'
        });
}