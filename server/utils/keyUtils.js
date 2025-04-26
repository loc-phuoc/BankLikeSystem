import sss from 'shamirs-secret-sharing';
import BlockchainUtil from './blockchainUtils.js';

const KeyUtil = {
    splitKey(aesKey, totalShares = 4, threshold = 2) {
        return sss.split(aesKey, { shares: totalShares, threshold });
    },

    combineShares(shares) {
        return sss.combine(shares);
    },

    processPrivateKey(privateKey) {
        const aesKey = BlockchainUtil.generateAESKey();
        const encryptedPrivateKey = BlockchainUtil.encryptPrivateKey(privateKey, aesKey);

        const shares = this.splitKey(aesKey);

        const dbShare = shares[0];
        const userShare1 = shares[1];
        const userShare2 = shares[2];
        const userShare3 = shares[3];

        return {
            dbShare: Buffer.from(dbShare).toString('hex'),
            userShare1: Buffer.from(userShare1).toString('hex'),
            userShare2: Buffer.from(userShare2).toString('hex'),
            userShare3: Buffer.from(userShare3).toString('hex'),
            encryptedPrivateKey
        };
    },

    reconstructPrivateKey(dbShare, share, encryptedPrivateKey) { 
        const dbShareBuffer = Buffer.from(dbShare, 'hex');
        const shareBuffer = Buffer.from(share, 'hex');
        const aesKey = this.combineShares([dbShareBuffer, shareBuffer]);
        return BlockchainUtil.decryptPrivateKey(encryptedPrivateKey, aesKey).toString();
    },
};

export default KeyUtil;