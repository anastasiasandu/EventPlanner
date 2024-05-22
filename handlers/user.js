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

    // Initialize the update data object
    const updatedData = {};

    // Conditionally add fields to the update data
    if (username) {
      updatedData.username = username;
    }
    if (email) {
      updatedData.email = email;
    }
    if (password) {
      updatedData.password = await bcrypt.hash(password, 12);
    }

    // Check if there's anything to update
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({ details: 'No update data provided' });
    }

    // Perform the update
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updatedData,
    });

    return res.status(200).json(updatedUser);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const errors = {};
      if (e.meta.target.includes('User_email_key')) {
        errors.email = ['This email is already in use'];
      } else if (e.meta.target.includes('User_username_key')) {
        errors.username = ['This username is already in use'];
      }
      return res.status(400).send(errors);
    }
    console.error(e);
    return res.status(500).json({ details: 'Internal server error' });
  }
}
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
 * /api/user/friends:
 *   get:
 *     summary: Get all friends of the current user
 *     tags: [Friend]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Friends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The user ID
 *                   username:
 *                     type: string
 *                     description: The username of the friend
 *                   email:
 *                     type: string
 *                     description: The email of the friend
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
const getAllFriends = async (req, res) => {


    try {
      const friends = await prisma.friend.findMany({
        where: {user1Id: req.user.id},
        include: {
          user2: true,
        },
      });

      const friendList = friends.map(friend => friend.user2);

      return res.status(200).json(friendList);
    } catch (e) {
      return res.status(500).json({details: 'Internal server error'});
    }

}


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

module.exports = { getUser, updateUser, deleteUser, addFriend, getAllFriends, deleteFriend };
