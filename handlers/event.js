const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Event]
 *     responses:
 *       200:
 *         description: List of all events
 *       500:
 *         description: Internal server error
 */
const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        organizer: true,
        participants: true,
      },
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: true,
        participants: true,
      },
    });
    if (!event) {
      return res.status(404).json({ details: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Event]
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
 *               startTime:
 *                 type: number
 *               endTime:
 *                 type: number
 *               location:
 *                 type: string
 *               public:
 *                 type: boolean
 *               tags:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created successfully
 *       500:
 *         description: Internal server error
 */
const createEvent = async (req, res) => {
  try {
    const { title, description, startTime, endTime, location, public, tags } = req.body;
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startTime,
        endTime,
        location,
        public,
        tags,
        organizerId: req.user.id, // Organizer is the current user
      },
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
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
 *               startTime:
 *                 type: number
 *               endTime:
 *                 type: number
 *               location:
 *                 type: string
 *               public:
 *                 type: boolean
 *               tags:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, location, public, tags } = req.body;

    // Find the event
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ details: 'Event not found' });
    }

    // Check if the current user is the organizer
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ details: 'Forbidden' });
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        startTime,
        endTime,
        location,
        public,
        tags,
      },
    });

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     responses:
 *       204:
 *         description: Event deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the event
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ details: 'Event not found' });
    }

    // Check if the current user is the organizer
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ details: 'Forbidden' });
    }

    // Delete the event
    await prisma.event.delete({
      where: { id },
    });

    res.status(204).json();
  } catch (error) {
    res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/events/{id}/participate:
 *   post:
 *     summary: Participate in an event
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Participation successful
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
const participateInEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the event
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ details: 'Event not found' });
    }

    // Add the user to the participants
    await prisma.event.update({
      where: { id },
      data: {
        participants: {
          connect: { id: req.user.id },
        },
      },
    });

    res.status(200).json({ details: 'Participation successful' });
  } catch (error) {
    res.status(500).json({ details: 'Internal server error' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  participateInEvent,
};
