const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createNotification } = require('../services/notificationService');



/**
 * @swagger
 * /api/event:
 *   get:
 *     summary: Get all events with optional filters and sorting
 *     tags: [Event]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by event title
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by event location
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: number
 *         required: false
 *         description: Filter by start time (timestamp)
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: number
 *         required: false
 *         description: Filter by end time (timestamp)
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by tags (comma-separated values)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         required: false
 *         description: Sort by start time (asc or desc)
 *     responses:
 *       200:
 *         description: List of filtered events
 *       500:
 *         description: Internal server error
 */
const getAllEvents = async (req, res) => {
  try {
    const { title, location, startTime, endTime, tags, sort } = req.query;

    const filters = {};

    if (title) {
      filters.title = { contains: title, mode: 'insensitive' }; // Case-insensitive search
    }

    if (location) {
      filters.location = { contains: location, mode: 'insensitive' };
    }

    if (startTime) {
      filters.startTime = { gte: Number(startTime) };
    }

    if (endTime) {
      filters.endTime = { lte: Number(endTime) };
    }

    if (tags) {
      filters.tags = { hasSome: tags.split(',') }; // Assuming tags are stored as an array in the database
    }

    const orderBy = sort ? { startTime: sort } : {};

    const events = await prisma.event.findMany({
      where: filters,
      orderBy,
      include: {
        organizer: true,
        participants: true,
      },
    });

    return res.status(200).json(events);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ details: 'Internal server error' });
  }
};


/**
 * @swagger
 * /api/event/{id}:
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
 * /api/event:
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
 *               tags:
 *                 type: string
 *                 enum: [ART, BOOK_CLUB, BUSINESS, CHARITY, CONCERT, CONFERENCE, CULTURE, EDUCATION, FAMILY, FASHION, FESTIVAL, FITNESS, FOOD, GAMING, HEALTH, LECTURE, MEETUP, MOVIE, MUSIC, NETWORKING, OTHER, OUTDOORS, PARTY, PHOTOGRAPHY, SCIENCE, SPORTS, TECH, THEATRE, TRAVEL, WORKSHOP]
 *     responses:
 *       201:
 *         description: Event created successfully
 *       500:
 *         description: Internal server error
 */
const createEvent = async (req, res) => {
  try {
    const { title, description, startTime, endTime, location, tags } = req.body;
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startTime: Number(startTime),
        endTime: Number(endTime),
        location,
        tags,
        organizerId: req.user.id, // Organizer is the current user
      },
    });
    await createNotification(req.user.id, `You successfully created an event.`);
    res.status(201).json(event);
  } catch (error) {
    console.log(error);
    res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/event/{id}:
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
 *               tags:
 *                 type: string
 *                 enum: [ART, BOOK_CLUB, BUSINESS, CHARITY, CONCERT, CONFERENCE, CULTURE, EDUCATION, FAMILY, FASHION, FESTIVAL, FITNESS, FOOD, GAMING, HEALTH, LECTURE, MEETUP, MOVIE, MUSIC, NETWORKING, OTHER, OUTDOORS, PARTY, PHOTOGRAPHY, SCIENCE, SPORTS, TECH, THEATRE, TRAVEL, WORKSHOP]
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
    const { title, description, startTime, endTime, location, tags } = req.body;

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
        tags,
      },
    });
    await createNotification(req.user.id, `You successfully created an event.`);
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.log(error)
    res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/event/{id}:
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
      include: {
        participants: true,
      },
    });

    if (!event) {
      return res.status(404).json({ details: 'Event not found' });
    }

    // Check if the current user is the organizer
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({ details: 'Forbidden' });
    }

    // Notify all participants about the event cancellation
    const notifications = event.participants.map(participant => {
      return createNotification(participant.id, `The event "${event.title}" has been cancelled.`);
    });

    // Execute all notifications in parallel
    await Promise.all(notifications);

    // Delete participation records
    await prisma.event.update({
      where: { id },
      data: {
        participants: {
          set: [], // Remove all participants
        },
      },
    });

    // Delete the event
    await prisma.event.delete({
      where: { id },
    });

    await createNotification(req.user.id, `You successfully deleted the event "${event.title}".`);

    res.status(204).json();
  } catch (error) {
    console.log(error);
    res.status(500).json({ details: 'Internal server error' });
  }
};


/**
 * @swagger
 * /api/event/{id}/participate:
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
    await createNotification(req.user.id, `You successfully joined an event.`);
    res.status(200).json({ details: 'Participation successful' });
  } catch (error) {
    res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/event/{id}/participants:
 *   get:
 *     summary: Get all participants of an event
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
 *         description: Participants retrieved successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
const getEventParticipants = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!event) {
      return res.status(404).json({ details: 'Event not found' });
    }

    res.status(200).json(event.participants);
  } catch (error) {
    console.log(error);
    res.status(500).json({ details: 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/event/{id}/leave:
 *   post:
 *     summary: Leave an event
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
 *         description: Successfully left the event
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
const leaveEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ details: 'Event not found' });
    }

    await prisma.event.update({
      where: { id },
      data: {
        participants: {
          disconnect: { id: req.user.id },
        },
      },
    });
    await createNotification(req.user.id, `You successfully left the event.`);
    res.status(200).json({ details: 'Successfully left the event' });
  } catch (error) {
    console.log(error);
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
  getEventParticipants,
  leaveEvent,
};
