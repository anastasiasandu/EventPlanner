const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: CRUD operations for events
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     description: Create a new event with title, description, and date.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       '200':
 *         description: Successful creation of the event
 *       '500':
 *         description: Internal server error
 */
router.post('/', authMiddleware, async (req, res) => {
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

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events
 *     description: Retrieve all events created by the authenticated user.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful retrieval of events
 *       '500':
 *         description: Internal server error
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.userId });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event
 *     description: Update an existing event by ID with new title, description, and date.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the event to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       '200':
 *         description: Successful update of the event
 *       '500':
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, async (req, res) => {
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

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     description: Delete an existing event by ID.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the event to delete
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful deletion of the event
 *       '500':
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await Event.findByIdAndDelete(id);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
