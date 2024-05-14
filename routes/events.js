// routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const authMiddleware = require('../middleware/auth');

// Middleware to authenticate JWT token
router.use(authMiddleware);

// CRUD operations for events
router.post('/', async (req, res) => {
    try {
        const { title, description, date } = req.body;
        const event = new Event({
            title,
            description,
            date,
            organizer: req.userId, // Comes from the JWT payload
        });
        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.userId });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date } = req.body;
        const event = await Event.findByIdAndUpdate(
            id,
            { title, description, date },
            { new: true }
        );
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Event.findByIdAndDelete(id);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
