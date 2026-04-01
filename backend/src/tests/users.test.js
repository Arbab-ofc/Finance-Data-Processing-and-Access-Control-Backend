import mongoose from 'mongoose';
import request from 'supertest';

import app from '../app.js';
import { createUsersByRole, authHeader, createUserFixture } from './helpers/testHelpers.js';

describe('User Management Endpoints', () => {
  test('admin can create user', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .post('/api/v1/users')
      .set(authHeader(admin))
      .send({
        name: 'New Viewer',
        email: 'newviewer@test.local',
        password: 'NewViewer@123',
        role: 'viewer',
        status: 'active',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('newviewer@test.local');
    expect(response.body.data.password).toBeUndefined();
  });

  test('non-admin cannot create user', async () => {
    const { analyst } = await createUsersByRole();

    const response = await request(app)
      .post('/api/v1/users')
      .set(authHeader(analyst))
      .send({
        name: 'Blocked User',
        email: 'blocked@test.local',
        password: 'Blocked@123',
        role: 'viewer',
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.success).toBe(false);
  });

  test('duplicate email rejected', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .post('/api/v1/users')
      .set(authHeader(admin))
      .send({
        name: 'Duplicate Viewer',
        email: 'viewer@test.local',
        password: 'Duplicate@123',
        role: 'viewer',
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.success).toBe(false);
  });

  test('admin can list users', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .get('/api/v1/users?page=1&limit=2&sortBy=name&order=asc')
      .set(authHeader(admin));

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBe(2);
    expect(response.body.meta.total).toBe(4);
    expect(response.body.data.every((user) => user.password === undefined)).toBe(true);
  });

  test('admin can get single user', async () => {
    const { admin, analyst } = await createUsersByRole();

    const response = await request(app)
      .get(`/api/v1/users/${analyst._id}`)
      .set(authHeader(admin));

    expect(response.statusCode).toBe(200);
    expect(response.body.data.email).toBe(analyst.email);
    expect(response.body.data.password).toBeUndefined();
  });

  test('admin can update user', async () => {
    const { admin, viewer } = await createUsersByRole();

    const response = await request(app)
      .patch(`/api/v1/users/${viewer._id}`)
      .set(authHeader(admin))
      .send({ name: 'Viewer Updated' });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.name).toBe('Viewer Updated');
  });

  test('admin can change role', async () => {
    const { admin, viewer } = await createUsersByRole();

    const response = await request(app)
      .patch(`/api/v1/users/${viewer._id}/role`)
      .set(authHeader(admin))
      .send({ role: 'analyst' });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.role).toBe('analyst');
  });

  test('admin can change status', async () => {
    const { admin, viewer } = await createUsersByRole();

    const response = await request(app)
      .patch(`/api/v1/users/${viewer._id}/status`)
      .set(authHeader(admin))
      .send({ status: 'inactive' });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.status).toBe('inactive');
  });

  test('invalid user id handled', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .get('/api/v1/users/not-an-id')
      .set(authHeader(admin));

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('missing user handled', async () => {
    const { admin } = await createUsersByRole();
    const id = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/v1/users/${id}`)
      .set(authHeader(admin));

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test('admin can reset user password', async () => {
    const { admin, viewer } = await createUsersByRole();

    const response = await request(app)
      .patch(`/api/v1/users/${viewer._id}/password-reset`)
      .set(authHeader(admin))
      .send({ password: 'FreshPass@123' });

    expect(response.statusCode).toBe(200);

    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: viewer.email,
      password: 'FreshPass@123',
    });

    expect(loginResponse.statusCode).toBe(200);
  });

  test('users list validation handles invalid enum', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .get('/api/v1/users?role=invalid')
      .set(authHeader(admin));

    expect(response.statusCode).toBe(400);
  });

  test('users list uses default pagination when omitted', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .get('/api/v1/users')
      .set(authHeader(admin));

    expect(response.statusCode).toBe(200);
    expect(response.body.meta.page).toBe(1);
    expect(response.body.meta.limit).toBe(10);
  });

  test('cannot update user to duplicate email', async () => {
    const { admin, analyst, viewer } = await createUsersByRole();
    expect(analyst.email).not.toBe(viewer.email);

    const response = await request(app)
      .patch(`/api/v1/users/${viewer._id}`)
      .set(authHeader(admin))
      .send({ email: analyst.email });

    expect(response.statusCode).toBe(409);
  });

  test('users routes reject missing token', async () => {
    const user = await createUserFixture({ role: 'viewer' });

    const response = await request(app).get(`/api/v1/users/${user._id}`);

    expect(response.statusCode).toBe(401);
  });

  test('admin cannot deactivate self', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .patch(`/api/v1/users/${admin._id}/status`)
      .set(authHeader(admin))
      .send({ status: 'inactive' });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Admin cannot deactivate own account');
  });
});
