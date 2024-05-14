const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Log in a user with username and password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       '401':
 *         description: Invalid username or password
 *       '500':
 *         description: Internal server error
 */
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        // Compare hashed passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'secretkey');
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with username, password, and email.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful registration
 *       '400':
 *         description: Username or email already exists, or invalid data
 *       '500':
 *         description: Internal server error
 */

const User = require('../models/User');

router.post('/signup', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Validation: Check username for special characters
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            return res.status(400).json({ message: 'The username is invalid. It must not contain special characters' });
        }

        // Validation: Check password length
        if (password.length < 5) {
            return res.status(400).json({ message: 'The password is too short. It must be at least 5 characters long' });
        }

        // Validation: Check if email contains '@'
        if (!email.includes('@')) {
            return res.status(400).json({ message: 'Invalid email address. It must contain "@"' });
        }

        // Check if the username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Create a new user instance with hashed password
        const newUser = new User({ username, password: hashedPassword, email });

        // Save the user to the database
        await newUser.save();

        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




module.exports = router;
