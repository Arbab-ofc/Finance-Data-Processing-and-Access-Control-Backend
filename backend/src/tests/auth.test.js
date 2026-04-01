import request from 'supertest';

import app from '../app.js';
import { createUsersByRole } from './helpers/testHelpers.js';

describe('Auth Endpoints', () => {
  test('login success', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: 'Password@123' });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user.email).toBe(admin.email);
    expect(response.body.data.user.password).toBeUndefined();
  });

  test('login with invalid password', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: 'WrongPassword@123' });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid email or password');
  });

  test('login with inactive user', async () => {
    const { inactive } = await createUsersByRole();

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: inactive.email, password: 'Password@123' });

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Your account is inactive');
  });

  test('me route with valid token', async () => {
    const { admin } = await createUsersByRole();

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: 'Password@123' });

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.email).toBe(admin.email);
  });

  test('me route without token', async () => {
    const response = await request(app).get('/api/v1/auth/me');

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('logout route with valid token', async () => {
    const { admin } = await createUsersByRole();

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: 'Password@123' });

    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Logout successful');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  test('login validation failure', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({ email: 'bad', password: '123' });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors.length).toBeGreaterThanOrEqual(1);
  });

  test('login sets auth cookie', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: 'Password@123' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'][0]).toContain('token=');
  });

  test('protected routes accept cookie-based token', async () => {
    const { admin } = await createUsersByRole();

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: 'Password@123' });

    const cookie = login.headers['set-cookie'][0];
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookie);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.email).toBe(admin.email);
  });
});
