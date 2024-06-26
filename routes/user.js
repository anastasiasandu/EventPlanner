const express = require('express');
const { getUser, updateUser, deleteUser, addFriend, getAllFriends, deleteFriend, getAllNotifications } = require('../handlers/user');
const router = express.Router();
const authToken = require("../middlewares/authMiddlewares")

router.get('/:id', getUser);
router.put('/', authToken, updateUser);
router.delete('/', authToken, deleteUser);
router.post('/friends', authToken, addFriend);
router.get('/friends', authToken, getAllFriends);
router.delete('/friends', authToken, deleteFriend);
router.get('/notifications', authToken, getAllNotifications)


module.exports = router;
