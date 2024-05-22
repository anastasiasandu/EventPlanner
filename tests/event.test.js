const request = require('supertest');
const app = require('../app'); // Ensure the path is correct
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let token;
let eventId;

beforeAll(async () => {
  // Create a test user for authentication
  const response = await request(app)
    .post('/api/auth/signup')
    .send({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
    });

  token = (await request(app)
    .post('/api/auth/login')
    .send({
      email: 'testuser@example.com',
      password: 'password123',
    })).body.access;
});

afterAll(async () => {
  // Clean up the test user
  await prisma.$disconnect();
});

describe('Event Endpoints', () => {
  it('should create a new event', async () => {
    const response = await request(app)
      .post('/api/event')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Event',
        description: 'This is a test event',
        startTime: Date.now(),
        endTime: Date.now() + 3600000,
        location: 'Test Location',
        tags: 'TECH',
      });
    eventId = response.body.id;
    expect(response.statusCode).toBe(201);
  });

  it('should get all events', async () => {
    const response = await request(app)
      .get('/api/event')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should get event by ID', async () => {
    const response = await request(app)
      .get(`/api/event/${eventId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', eventId);
  });

  it('should update an event', async () => {
    const response = await request(app)
      .put(`/api/event/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Event',
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('title', 'Updated Event');
  });

  it('should delete an event', async () => {
    const response = await request(app)
      .delete(`/api/event/${eventId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(204);
  });
});
