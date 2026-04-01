import mongoose from 'mongoose';
import request from 'supertest';

import app from '../app.js';
import { createRecordFixture, createUsersByRole, authHeader } from './helpers/testHelpers.js';

describe('Record Endpoints', () => {
  test('admin can create record', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .post('/api/v1/records')
      .set(authHeader(admin))
      .send({
        amount: 5000,
        type: 'income',
        category: 'Freelance',
        date: '2025-01-01',
        description: 'API project payment',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.data.type).toBe('income');
  });

  test('viewer cannot create record', async () => {
    const { viewer } = await createUsersByRole();

    const response = await request(app)
      .post('/api/v1/records')
      .set(authHeader(viewer))
      .send({ amount: 500, type: 'expense', category: 'Food', date: '2025-01-01' });

    expect(response.statusCode).toBe(403);
  });

  test('analyst cannot create record', async () => {
    const { analyst } = await createUsersByRole();

    const response = await request(app)
      .post('/api/v1/records')
      .set(authHeader(analyst))
      .send({ amount: 500, type: 'expense', category: 'Food', date: '2025-01-01' });

    expect(response.statusCode).toBe(403);
  });

  test('authenticated users can list records', async () => {
    const { admin, viewer } = await createUsersByRole();

    await createRecordFixture({ createdBy: admin._id, updatedBy: admin._id });
    await createRecordFixture({ createdBy: admin._id, updatedBy: admin._id, category: 'Transport' });

    const response = await request(app)
      .get('/api/v1/records')
      .set(authHeader(viewer));

    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(2);
  });

  test('record filters work', async () => {
    const { admin, analyst } = await createUsersByRole();

    await createRecordFixture({ createdBy: admin._id, type: 'expense', category: 'Food', date: new Date('2025-01-02') });
    await createRecordFixture({ createdBy: admin._id, type: 'income', category: 'Salary', amount: 9000, date: new Date('2025-01-15') });

    const response = await request(app)
      .get('/api/v1/records?type=expense&category=Food&startDate=2025-01-01&endDate=2025-01-31')
      .set(authHeader(analyst));

    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].type).toBe('expense');
  });

  test('record pagination works', async () => {
    const { admin } = await createUsersByRole();

    for (let index = 0; index < 4; index += 1) {
      await createRecordFixture({ createdBy: admin._id, amount: 100 + index, description: `Record ${index}` });
    }

    const response = await request(app)
      .get('/api/v1/records?page=2&limit=2')
      .set(authHeader(admin));

    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(2);
    expect(response.body.meta.page).toBe(2);
    expect(response.body.meta.total).toBe(4);
  });

  test('single record fetch works', async () => {
    const { admin, analyst } = await createUsersByRole();
    const record = await createRecordFixture({ createdBy: admin._id, updatedBy: admin._id });

    const response = await request(app)
      .get(`/api/v1/records/${record._id}`)
      .set(authHeader(analyst));

    expect(response.statusCode).toBe(200);
    expect(response.body.data._id).toBe(record._id.toString());
  });

  test('admin can update record', async () => {
    const { admin } = await createUsersByRole();
    const record = await createRecordFixture({ createdBy: admin._id, updatedBy: admin._id });

    const response = await request(app)
      .patch(`/api/v1/records/${record._id}`)
      .set(authHeader(admin))
      .send({ amount: 2222, description: 'Updated desc' });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.amount).toBe(2222);
  });

  test('non-admin cannot update record', async () => {
    const { admin, viewer } = await createUsersByRole();
    const record = await createRecordFixture({ createdBy: admin._id, updatedBy: admin._id });

    const response = await request(app)
      .patch(`/api/v1/records/${record._id}`)
      .set(authHeader(viewer))
      .send({ amount: 3333 });

    expect(response.statusCode).toBe(403);
  });

  test('admin can delete record', async () => {
    const { admin } = await createUsersByRole();
    const record = await createRecordFixture({ createdBy: admin._id, updatedBy: admin._id });

    const response = await request(app)
      .delete(`/api/v1/records/${record._id}`)
      .set(authHeader(admin));

    expect(response.statusCode).toBe(200);
    expect(response.body.data.id).toBe(record._id.toString());
  });

  test('non-admin cannot delete record', async () => {
    const { admin, analyst } = await createUsersByRole();
    const record = await createRecordFixture({ createdBy: admin._id, updatedBy: admin._id });

    const response = await request(app)
      .delete(`/api/v1/records/${record._id}`)
      .set(authHeader(analyst));

    expect(response.statusCode).toBe(403);
  });

  test('invalid record id handled', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .get('/api/v1/records/invalid-id')
      .set(authHeader(admin));

    expect(response.statusCode).toBe(400);
  });

  test('missing record handled', async () => {
    const { admin } = await createUsersByRole();
    const id = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/v1/records/${id}`)
      .set(authHeader(admin));

    expect(response.statusCode).toBe(404);
  });

  test('invalid query params rejected', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .get('/api/v1/records?order=wrong')
      .set(authHeader(admin));

    expect(response.statusCode).toBe(400);
  });

  test('invalid enum payload rejected', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .post('/api/v1/records')
      .set(authHeader(admin))
      .send({ amount: 100, type: 'bonus', category: 'Food', date: '2025-01-01' });

    expect(response.statusCode).toBe(400);
  });

  test('date range query rejects endDate before startDate', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .get('/api/v1/records?startDate=2025-02-01&endDate=2025-01-01')
      .set(authHeader(admin));

    expect(response.statusCode).toBe(400);
  });

  test('amount range query rejects maxAmount lower than minAmount', async () => {
    const { admin } = await createUsersByRole();

    const response = await request(app)
      .get('/api/v1/records?minAmount=500&maxAmount=100')
      .set(authHeader(admin));

    expect(response.statusCode).toBe(400);
  });
});
