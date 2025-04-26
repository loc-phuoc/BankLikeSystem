import UserService from '../services/userService.js';
import { updateUserAllowPayment } from '../callback/userCallback';

export async function createUser(req, res) {
  try {
    const { username, email } = req.body;
    const newUser = await UserService.handleCreateUser(username, email);

    await updateUserAllowPayment(newUser.address, newUser.username);

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export async function regainShare(req, res) {
  try {
    const { address, share } = req.body;
    const result = await UserService.handleRegainShare(address, share);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export async function getUserByAddress(req, res) {
  try {
    const { address } = req.params;
    const user = await UserService.handleGetUserByAddress(address);
    res.json(user);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export async function getUsers(req, res) {
  try {
    const users = await UserService.handleGetUsers();
    res.json(users);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export async function findUserByUsername(req, res) {
  try {
    const { username } = req.params;
    const user = await UserService.handleFindUserByUsername(username);
    res.json(user);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export async function changeUsername(req, res) {
  try {
    const { address } = req.params;
    const { newUsername, share } = req.body;
    const result = await UserService.handleChangeUsername(address, newUsername, share, req.env.bankOwnerAddress);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export async function changeEmail(req, res) {
  try {
    const { address } = req.params;
    const { newEmail, share } = req.body;
    const result = await UserService.handleChangeEmail(address, newEmail, share, req.env.bankOwnerAddress);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}
