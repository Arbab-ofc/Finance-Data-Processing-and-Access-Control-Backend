import request from 'supertest';

import app from '../app.js';

describe('App Baseline Endpoints', () => {
  test('health endpoint works', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('api root endpoint works', async () => {
    const response = await request(app).get('/api/v1');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('unknown route returns 404', async () => {
    const response = await request(app).get('/api/v1/does-not-exist');

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test('protected route rejects malformed bearer token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer malformed.token.value');

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('request id is generated when missing', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.headers['x-request-id']).toBeDefined();
  });

  test('request id is propagated when provided', async () => {
    const response = await request(app)
      .get('/health')
      .set('x-request-id', 'custom-id-123');

    expect(response.statusCode).toBe(200);
    expect(response.headers['x-request-id']).toBe('custom-id-123');
  });
});
