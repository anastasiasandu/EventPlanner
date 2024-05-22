const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/post:
 *   post:
 *     summary: Create a new post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the post
 *               eventId:
 *                 type: string
 *                 description: The ID of the event the post is related to
 *     responses:
 *       201:
 *         description: Post created successfully
 *       403:
 *         description: You are not participating in this event
 *       500:
 *         description: Internal server error
 */
const createPost = async (req, res) => {
  const { content, eventId } = req.body;

  try {
    // Check if user is participating in the event
    const isParticipating = await prisma.event.findFirst({
      where: {
        id: eventId,
        participants: {
          some: {
            id: req.user.id,
          },
        },
      },
    });

    if (!isParticipating) {
      return res.status(403).json({ details: 'You are not participating in this event' });
    }

    const post = await prisma.post.create({
      data: {
        content,
        eventId,
        userId: req.user.id,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/post/{id}:
 *   put:
 *     summary: Update an existing post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The new content of the post
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       403:
 *         description: You do not have permission to update this post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
const updatePost = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ details: 'Post not found' });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({ details: 'You do not have permission to update this post' });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { content },
    });

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/post/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to delete
 *     responses:
 *       204:
 *         description: Post deleted successfully
 *       403:
 *         description: You do not have permission to delete this post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ details: 'Post not found' });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({ details: 'You do not have permission to delete this post' });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(204).json({ details: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/post/event/{eventId}:
 *   get:
 *     summary: Get all posts for an event
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the event to get posts for
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
 *       500:
 *         description: Internal server error
 */
const getEventPosts = async (req, res) => {
  const { eventId } = req.params;

  try {
    const posts = await prisma.post.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ details: 'Internal server error' });
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getEventPosts,
};
