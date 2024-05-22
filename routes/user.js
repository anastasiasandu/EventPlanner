const express = require('express');
const router = express.Router();
const { getUser, updateUser, deleteUser, addFriend, getSingleFriend, getAllFriends, deleteFriend } = require('../handlers/user');
const { authenticate } = require('../middleware/authenticate');

// Middleware to protect routes
router.use(authenticate);

router.get('/:id', getUser);
router.put('/', updateUser);
router.delete('/', deleteUser);
router.post('/friends', addFriend);
router.get('/friend/:friendId', getSingleFriend);
router.get('/friends', getAllFriends);
router.delete('/friends', deleteFriend);

module.exports = router;
