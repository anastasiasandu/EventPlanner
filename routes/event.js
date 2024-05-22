const express = require('express');
const authToken = require("../middlewares/authMiddlewares")
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  participateInEvent,
} = require('../handlers/event');

const router = express.Router();

router.get('/events', authToken, getAllEvents);
router.get('/events/:id', authToken, getEventById);
router.post('/events', authToken, createEvent);
router.put('/events/:id', authToken, updateEvent);
router.delete('/events/:id', authToken, deleteEvent);
router.post('/events/:id/participate', authToken, participateInEvent);

module.exports = router;
