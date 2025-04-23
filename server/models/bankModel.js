import { web3, bank } from '../config/blockchain.js';
import env from '../config/env.js';

export async function getBankOwner() {
    return bank.methods.owner().call();
}

export async function depositToUser(userAddress, amount) {
    const amountWei = web3.utils.toWei(amount.toString(), 'ether');

    return bank.methods.deposit(userAddress, amountWei)
        .send({
            from: env.bankOwnerAddress,
            gas: env.defaultGas,
            type: '0x0'
        });
}

export async function withdrawFromUser(userAddress, amount) {
    const amountWei = web3.utils.toWei(amount.toString(), 'ether');

    return bank.methods.withdraw(amountWei)
        .send({
            from: userAddress,
            gas: env.defaultGas,
            type: '0x0'
        });
}