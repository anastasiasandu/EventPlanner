const express = require('express');
const {
  createPost,
  updatePost,
  deletePost,
  getEventPosts,
} = require('../handlers/post');
const authToken = require('../middlewares/authMiddlewares');

const router = express.Router();

router.post('/', authToken, createPost);
router.put('/:id', authToken, updatePost);
router.delete('/:id', authToken, deletePost);
router.get('/event/:eventId', getEventPosts);

module.exports = router;
