import { web3 } from '../config/blockchain.js';
import { 
  createUser as createUserModel, 
  getUserDetails, 
  getAllUsers, 
  getUserByUsername, 
  checkUserExists,
  changeUsername as changeUsernameModel,
  changeEmail as changeEmailModel
} from '../models/userModel.js';

export async function createUser(req, res) {
  try {
    const { username, email } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const newUser = await createUserModel(username, email);
    
    res.status(201).json({
      success: true,
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function getUserByAddress(req, res) {
  try {
    const { address } = req.params;
    
    const user = await getUserDetails(address);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error.message);
    res.status(500).json({ error: 'Failed to get user details' });
  }
}

export async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error.message);
    res.status(500).json({ error: 'Failed to get users' });
  }
}

export async function findUserByUsername(req, res) {
  try {
    const { username } = req.params;
    
    const user = await getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ error: 'Username not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user by username:', error.message);
    res.status(500).json({ error: 'Failed to get user by username' });
  }
}

export async function changeUsername(req, res) {
  try {
    const { address } = req.params;
    const { newUsername, privateKey } = req.body;
    
    if (!newUsername) {
      return res.status(400).json({ error: 'New username is required' });
    }
    
    // Verify user exists
    const exists = await checkUserExists(address);
    if (!exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prepare the account that will send the transaction
    let sender = req.env.bankOwnerAddress;
    
    // If private key is provided, use it instead of bank owner
    if (privateKey) {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(account);
      sender = account.address;
      
      // Verify the sender matches the address being modified
      if (sender.toLowerCase() !== address.toLowerCase()) {
        return res.status(403).json({ error: 'Private key does not match the user address' });
      }
    }
    
    // Change username
    await changeUsernameModel(address, newUsername, sender);
    
    // Get updated user details
    const updatedUser = await getUserDetails(address);
    
    res.json({
      success: true,
      message: 'Username updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error changing username:', error.message);
    res.status(500).json({ error: 'Failed to change username' });
  }
}

export async function changeEmail(req, res) {
  try {
    const { address } = req.params;
    const { newEmail, privateKey } = req.body;
    
    if (!newEmail) {
      return res.status(400).json({ error: 'New email is required' });
    }
    
    // Verify user exists
    const exists = await checkUserExists(address);
    if (!exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prepare the account that will send the transaction
    let sender = req.env.bankOwnerAddress;
    
    // If private key is provided, use it instead of bank owner
    if (privateKey) {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(account);
      sender = account.address;
      
      // Verify the sender matches the address being modified
      if (sender.toLowerCase() !== address.toLowerCase()) {
        return res.status(403).json({ error: 'Private key does not match the user address' });
      }
    }
    
    // Change email
    await changeEmailModel(address, newEmail, sender);
    
    // Get updated user details
    const updatedUser = await getUserDetails(address);
    
    res.json({
      success: true,
      message: 'Email updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error changing email:', error.message);
    res.status(500).json({ error: 'Failed to change email' });
  }
}