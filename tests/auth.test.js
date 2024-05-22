const request = require('supertest');
const app = require('../app'); // Ensure the path is correct
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let token;

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

describe('Auth Endpoints', () => {
  it('should sign up a new user', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      });
    expect(response.statusCode).toBe(201);
    await prisma.user.delete({ where: { email: 'newuser@example.com' } });
  });

  it('should log in a user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('access');
  });

  it('should get current logged-in user details', async () => {
    const response = await request(app)
      .get('/api/auth/current')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('email', 'testuser@example.com');
  });

  it('should refresh access token', async () => {
    const response = await request(app)
      .get('/api/auth/refresh')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('access');
  });


});
