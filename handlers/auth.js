const { PrismaClient, Prisma } = require('@prisma/client');
const { signupValidator, loginValidator } = require('../validators/auth');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

1
const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related endpoints
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation errors or user already exists
 *       500:
 *         description: Internal server error
 */
const signup = async (req, res) => {
  try {
    let errors = await signupValidator(req.body);

    const { username, email, password } = req.body;

    if (!_.isEmpty(errors)) {
      return res.status(400).send(errors);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).send(user);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const errors = {};
      errors[e.meta.target[0]] = [`${e.meta.target} already exists`];
      return res.status(400).send(errors);
    }
    return res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid credentials
 */
const login = async (req, res) => {
  let output = await loginValidator(req.body);
  let errors = output.errors;
  let user = output.user;

  if (_.isEmpty(errors)) {
    let privateKey = "3245d4b2cef8db37d893f54df31c42d7f936b109d397c5384334043d2765eb4c";
    let access = jwt.sign({ id: user.id, type: 'access' }, privateKey, { expiresIn: 60 * 15 });
    let refresh = jwt.sign({ id: user.id, type: 'refresh' }, privateKey, { expiresIn: 60 * 60 * 12 });

    res.cookie('refresh', refresh, { httpOnly: true, secure: true, samesite: 'none', maxAge: 1000 * 60 * 60 * 12 });
    return res.status(200).json({ access: access });
  } else {
    return res.status(400).send(errors);
  }
};

/**
 * @swagger
 * /api/auth/current:
 *   get:
 *     summary: Get current logged-in user's details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       401:
 *         description: Unauthorized
 */
const current = async (req, res) => {
  let user = req.user;
  // const { username, email } = user;
  // return res.status(200).json({ username, email });
  console.log(req.user)
  return res.status(200).json(req.user)
};

/**
 * @swagger
 * /api/auth/refresh:
 *   get:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Bad token
 *       500:
 *         description: Internal server error
 */
const refresh = async (req, res) => {
  let refresh = req.headers;
  if (refresh) {
    try {
      refresh = req.headers.authorization.split(" ")[1];
      const privateKey = "3245d4b2cef8db37d893f54df31c42d7f936b109d397c5384334043d2765eb4c";
      let decoded = jwt.verify(refresh, privateKey);

      const access = jwt.sign({ id: decoded.id, type: 'access' }, privateKey, { expiresIn: 60 * 15 });

      return res.status(200).json({ access: access });
    } catch (e) {

      return res.status(401).json({ details: 'bad token' });
    }
  }
  return res.status(500);
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 */
const logout = async (req, res) => {
  let user = req.user;
  return res.clearCookie('refresh').status(200).json({ details: 'successfully logged out' });
};

module.exports = { signup, login, current, refresh, logout };
