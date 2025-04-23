import { Router } from 'express';
import { 
  createUser, 
  getUserByAddress, 
  getUsers, 
  findUserByUsername,
  changeUsername,
  changeEmail
} from '../controllers/userController.js';

const router = Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with blockchain wallet
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username for the new user
 *               email:
 *                 type: string
 *                 description: Email address for the new user
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/users', createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users in the system
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /users/{address}:
 *   get:
 *     summary: Get user by address
 *     description: Returns a user by their blockchain address
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Blockchain address of the user
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/users/:address', getUserByAddress);

/**
 * @swagger
 * /users/username/{username}:
 *   get:
 *     summary: Find user by username
 *     description: Returns a user by their username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to look up
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Username not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/users/username/:username', findUserByUsername);

/**
 * @swagger
 * /users/{address}/username:
 *   put:
 *     summary: Change username
 *     description: Updates a user's username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Blockchain address of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newUsername
 *             properties:
 *               newUsername:
 *                 type: string
 *                 description: New username for the user
 *               privateKey:
 *                 type: string
 *                 description: Private key for transaction signing (optional if using owner)
 *     responses:
 *       200:
 *         description: Username updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Username updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Private key does not match address
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/users/:address/username', changeUsername);

/**
 * @swagger
 * /users/{address}/email:
 *   put:
 *     summary: Change email
 *     description: Updates a user's email address
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Blockchain address of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *             properties:
 *               newEmail:
 *                 type: string
 *                 description: New email for the user
 *               privateKey:
 *                 type: string
 *                 description: Private key for transaction signing (optional if using owner)
 *     responses:
 *       200:
 *         description: Email updated successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Private key does not match address
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/users/:address/email', changeEmail);

export default router;