import request from 'supertest';

import app from '../app.js';
import { createRecordFixture, createUsersByRole, authHeader } from './helpers/testHelpers.js';

describe('Dashboard Endpoints', () => {
  test('authenticated user can get summary', async () => {
    const { admin, viewer } = await createUsersByRole();

    await createRecordFixture({ createdBy: admin._id, type: 'income', category: 'Salary', amount: 10000 });
    await createRecordFixture({ createdBy: admin._id, type: 'expense', category: 'Food', amount: 3500 });

    const response = await request(app)
      .get('/api/v1/dashboard/summary')
      .set(authHeader(viewer));

    expect(response.statusCode).toBe(200);
    expect(response.body.data.totalIncome).toBe(10000);
    expect(response.body.data.totalExpenses).toBe(3500);
    expect(response.body.data.netBalance).toBe(6500);
  });

  test('authenticated user can get category breakdown', async () => {
    const { admin, analyst } = await createUsersByRole();

    await createRecordFixture({ createdBy: admin._id, type: 'expense', category: 'Food', amount: 1500 });
    await createRecordFixture({ createdBy: admin._id, type: 'expense', category: 'Food', amount: 700 });

    const response = await request(app)
      .get('/api/v1/dashboard/category-breakdown')
      .set(authHeader(analyst));

    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty('category');
  });

  test('authenticated user can get trends', async () => {
    const { admin, viewer } = await createUsersByRole();

    await createRecordFixture({ createdBy: admin._id, type: 'income', category: 'Salary', amount: 5000, date: new Date('2025-01-04') });
    await createRecordFixture({ createdBy: admin._id, type: 'income', category: 'Salary', amount: 6000, date: new Date('2025-02-04') });

    const response = await request(app)
      .get('/api/v1/dashboard/trends')
      .set(authHeader(viewer));

    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty('month');
  });

  test('trends supports date-range filters', async () => {
    const { admin, viewer } = await createUsersByRole();

    await createRecordFixture({ createdBy: admin._id, type: 'income', category: 'Salary', amount: 5000, date: new Date('2025-01-04') });
    await createRecordFixture({ createdBy: admin._id, type: 'income', category: 'Salary', amount: 6000, date: new Date('2025-03-04') });

    const response = await request(app)
      .get('/api/v1/dashboard/trends?startDate=2025-02-01&endDate=2025-03-31')
      .set(authHeader(viewer));

    expect(response.statusCode).toBe(200);
    expect(response.body.data.every((item) => item.month >= 2)).toBe(true);
  });

  test('authenticated user can get recent activity', async () => {
    const { admin, analyst } = await createUsersByRole();

    await createRecordFixture({ createdBy: admin._id, description: 'older activity', date: new Date('2025-01-01') });
    await createRecordFixture({ createdBy: admin._id, description: 'newer activity', date: new Date('2025-02-01') });

    const response = await request(app)
      .get('/api/v1/dashboard/recent-activity?limit=1')
      .set(authHeader(analyst));

    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(1);
  });

  test('unauthorized dashboard request rejected', async () => {
    const response = await request(app).get('/api/v1/dashboard/summary');

    expect(response.statusCode).toBe(401);
  });

  test('recent activity validation rejects bad limit', async () => {
    const { viewer } = await createUsersByRole();

    const response = await request(app)
      .get('/api/v1/dashboard/recent-activity?limit=0')
      .set(authHeader(viewer));

    expect(response.statusCode).toBe(400);
  });

  test('trends validation rejects inverted date range', async () => {
    const { viewer } = await createUsersByRole();

    const response = await request(app)
      .get('/api/v1/dashboard/trends?startDate=2025-05-01&endDate=2025-01-01')
      .set(authHeader(viewer));

    expect(response.statusCode).toBe(400);
  });
});
