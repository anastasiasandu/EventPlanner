const express = require('express');
const authenticateToken = require('../middlewares/authMiddlewares'); // Adjust the path as necessary
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  participateInEvent,
  getEventParticipants,
  leaveEvent
} = require('../handlers/event');

const router = express.Router();


router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', authenticateToken, createEvent);
router.put('/:id', authenticateToken, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);
router.post('/:id/participate', authenticateToken, participateInEvent);
router.get('/:id/participants', getEventParticipants);
router.post('/:id/leave', authenticateToken, leaveEvent);


module.exports = router;
