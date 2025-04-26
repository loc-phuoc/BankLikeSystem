// --- services/userService.js ---
import {
  createUser as createUserModel,
  getUserDetails,
  getAllUsers,
  getUserByUsername,
  checkUserExists,
  changeUsername as changeUsernameModel,
  changeEmail as changeEmailModel
} from '../models/userModel.js';
import { web3 } from '../config/blockchain.js';
import KeyUtil from '../utils/keyUtils.js';
import User from '../schemas/userSchema.js';

const UserService = {
  async handleRegainShare(address, share) {
    if (!address || !share) throw { status: 400, message: 'Address and share are required' };

    const exists = await checkUserExists(address);
    if (!exists) throw { status: 404, message: 'User not found' };

    const userData = await User.findOne({ address: address });

    const username = userData.username;
    const email =    userData.email;

    const privateKey = KeyUtil.reconstructPrivateKey(userData.dbShare, share, userData.encryptedPrivateKey);

    const { dbShare, userShare1, userShare2, userShare3, encryptedPrivateKey } = KeyUtil.processPrivateKey(privateKey);

    await User.findOneAndUpdate(
      { address: address },
      { dbShare: dbShare, encryptedPrivateKey: encryptedPrivateKey },
      { new: true }    );

    return {
        username: username,
        email: email,
        address: address,
        shares: {
            userShare1,
            userShare2,
            userShare3
        }
    };
    
  },

  async handleCreateUser(username, email) {
    if (!username) throw { status: 400, message: 'Username is required' };
    return await createUserModel(username, email);
  },

  async handleGetUserByAddress(address) {
    const user = await getUserDetails(address);
    if (!user) throw { status: 404, message: 'User not found' };
    return user;
  },

  async handleGetUsers() {
    return await getAllUsers();
  },

  async handleFindUserByUsername(username) {
    const user = await getUserByUsername(username);
    if (!user) throw { status: 404, message: 'Username not found' };
    return user;
  },

  async handleChangeUsername(address, newUsername, share, bankOwnerAddress) {
    if (!newUsername) throw { status: 400, message: 'New username is required' };

    const exists = await checkUserExists(address);
    if (!exists) throw { status: 404, message: 'User not found' };

    const userData = await User.findOne({ address: address });

    const privateKey = KeyUtil.reconstructPrivateKey(userData.dbShare, share, userData.encryptedPrivateKey);

    let sender = bankOwnerAddress;
    if (privateKey) {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(account);
      sender = account.address;
      if (sender.toLowerCase() !== address.toLowerCase()) {
        throw { status: 403, message: 'Private key does not match the user address' };
      }
    }

    await changeUsernameModel(address, newUsername, sender);
    const updatedUser = await getUserDetails(address);

    return {
      success: true,
      message: 'Username updated successfully',
      user: updatedUser
    };
  },

  async handleChangeEmail(address, newEmail, share, bankOwnerAddress) {
    if (!newEmail) throw { status: 400, message: 'New email is required' };

    const exists = await checkUserExists(address);
    if (!exists) throw { status: 404, message: 'User not found' };

    const userData = await User.findOne({ address: address });

    const privateKey = KeyUtil.reconstructPrivateKey(userData.dbShare, share, userData.encryptedPrivateKey);

    let sender = bankOwnerAddress;
    if (privateKey) {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(account);
      sender = account.address;
      if (sender.toLowerCase() !== address.toLowerCase()) {
        throw { status: 403, message: 'Private key does not match the user address' };
      }
    }

    await changeEmailModel(address, newEmail, sender);
    const updatedUser = await getUserDetails(address);

    return {
      success: true,
      message: 'Email updated successfully',
      user: updatedUser
    };
  }
};

export default UserService;
