import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastSynced: {
        type: Date,
        default: Date.now
    },
    dbShare: {
        type: String,
        required: true,
    },
    encryptedPrivateKey: {
        type: Object,
        required: true,
    },
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;