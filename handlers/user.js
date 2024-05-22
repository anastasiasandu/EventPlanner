const { PrismaClient, Prisma } = require('@prisma/client');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
const getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({ details: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (e) {
    return res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/user:
 *   put:
 *     summary: Update current user
 *     tags: [User]
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
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation errors
 *       500:
 *         description: Internal server error
 */
const updateUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;

    const updatedData = {
      username,
      email,
      ...(hashedPassword && { password: hashedPassword }),
    };

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updatedData,
    });

    return res.status(200).json(updatedUser);
  } catch (e) {
    return res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/user:
 *   delete:
 *     summary: Delete current user account
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *       500:
 *         description: Internal server error
 */
const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id },
    });
    return res.status(200).json({ details: 'User account deleted successfully' });
  } catch (e) {
    return res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/user/friends:
 *   post:
 *     summary: Add a friend
 *     tags: [Friend]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friendId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Friend added successfully
 *       500:
 *         description: Internal server error
 */
const addFriend = async (req, res) => {
  try {
    const { friendId } = req.body;

    await prisma.friend.createMany({
      data: [
        { user1Id: req.user.id, user2Id: friendId },
        { user1Id: friendId, user2Id: req.user.id },
      ],
    });

    return res.status(200).json({ details: 'Friend added successfully' });
  } catch (e) {
    return res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/user/friend/{friendId}:
 *   get:
 *     summary: Get a friend's details by their ID
 *     tags: [Friend]
 *     parameters:
 *       - in: path
 *         name: friendId
 *         schema:
 *           type: string
 *         required: true
 *         description: Friend ID
 *     responses:
 *       200:
 *         description: Friend details retrieved successfully
 *       404:
 *         description: Friend not found
 *       500:
 *         description: Internal server error
 */
const getSingleFriend = async (req, res) => {
  try {
    const { friendId } = req.params;

    const friend = await prisma.friend.findFirst({
      where: {
        OR: [
          { user1Id: req.user.id, user2Id: friendId },
          { user1Id: friendId, user2Id: req.user.id },
        ],
      },
      include: {
        user1: true,
        user2: true,
      },
    });

    if (!friend) {
      return res.status(404).json({ details: 'Friend not found' });
    }

    const friendDetails = friend.user1Id === req.user.id ? friend.user2 : friend.user1;

    return res.status(200).json(friendDetails);
  } catch (e) {
    return res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/user/friends:
 *   get:
 *     summary: Get all friends of the current user
 *     tags: [Friend]
 *     responses:
 *       200:
 *         description: Friends retrieved successfully
 *       500:
 *         description: Internal server error
 */
const getAllFriends = async (req, res) => {
  try {
    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { user1Id: req.user.id },
          { user2Id: req.user.id },
        ],
      },
      include: {
        user1: true,
        user2: true,
      },
    });

    const friendList = friends.map(friend => {
      if (friend.user1Id === req.user.id) {
        return friend.user2;
      } else {
        return friend.user1;
      }
    });

    return res.status(200).json(friendList);
  } catch (e) {
    return res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/user/friends:
 *   delete:
 *     summary: Delete a friend
 *     tags: [Friend]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friendId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Friend deleted successfully
 *       500:
 *         description: Internal server error
 */
const deleteFriend = async (req, res) => {
  try {
    const { friendId } = req.body;

    await prisma.friend.deleteMany({
      where: {
        OR: [
          { user1Id: req.user.id, user2Id: friendId },
          { user1Id: friendId, user2Id: req.user.id },
        ],
      },
    });

    return res.status(200).json({ details: 'Friend deleted successfully' });
  } catch (e) {
    return res.status(500).json({ details: 'Internal server error' });
  }
};

module.exports = { getUser, updateUser, deleteUser, addFriend, getSingleFriend, getAllFriends, deleteFriend };
