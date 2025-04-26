import crypto from 'crypto';

const AES_KEY_SIZE = 16; // 128 bits
const PBKDF2_ITERATIONS = 100000;
const BlockchainUtil = {
    generateAESKey() {
        return crypto.randomBytes(AES_KEY_SIZE);
    },

    pad(data) {
        const padding = AES_KEY_SIZE - (data.length % AES_KEY_SIZE);
        const padBuf = Buffer.alloc(padding, padding);
        return Buffer.concat([data, padBuf]);
    },

    unpad(padded) {
        const pad = padded[padded.length - 1];
        return padded.slice(0, -pad);
    },

    encryptPrivateKey(privateKey, aesKey) {
        const iv = crypto.randomBytes(AES_KEY_SIZE);
        const cipher = crypto.createCipheriv('aes-128-cbc', aesKey, iv);
        const ciphertext = Buffer.concat([cipher.update(privateKey), cipher.final()]);

        // Combine IV and ciphertext into a single Buffer and encode as Base64
        const combined = Buffer.concat([iv, ciphertext]);
        return combined.toString('base64');
    },

    decryptPrivateKey(combinedString, aesKey) {
        // Decode the Base64 string and split into IV and ciphertext
        const combined = Buffer.from(combinedString, 'base64');
        const iv = combined.slice(0, AES_KEY_SIZE);
        const ciphertext = combined.slice(AES_KEY_SIZE);

        // Decrypt using the extracted IV and ciphertext
        const decipher = crypto.createDecipheriv('aes-128-cbc', aesKey, iv);
        return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    },

    encryptShare(share, code) {
        const salt = crypto.randomBytes(16);
        const iv = crypto.randomBytes(16);
        const key = crypto.pbkdf2Sync(code, salt, PBKDF2_ITERATIONS, 16, 'sha256');
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        const padded = KeyUtil.pad(share);
        const encrypted = Buffer.concat([cipher.update(padded), cipher.final()]);
        return { salt, iv, encrypted };
    },

    recoverAESKey(code, salt, iv, encryptedShare) {
        const key = crypto.pbkdf2Sync(code, salt, PBKDF2_ITERATIONS, 16, 'sha256');
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedShare), decipher.final()]);
        return KeyUtil.unpad(decrypted);
    },

    generateResetCode(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const randomBytes = crypto.randomBytes(length);
        for (let i = 0; i < length; i++) {
            result += chars[randomBytes[i] % chars.length];
        }
        return result;
    }
};

export default BlockchainUtil;
