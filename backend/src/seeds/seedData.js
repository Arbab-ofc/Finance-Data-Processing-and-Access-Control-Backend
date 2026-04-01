import mongoose from 'mongoose';

import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { FinancialRecord } from '../models/FinancialRecord.js';
import { USER_ROLES } from '../constants/roles.js';
import { USER_STATUS } from '../constants/status.js';
import { RECORD_TYPES } from '../constants/finance.js';

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@finance.local',
    password: 'Admin@123',
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: 'Analyst User',
    email: 'analyst@finance.local',
    password: 'Analyst@123',
    role: USER_ROLES.ANALYST,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: 'Viewer User',
    email: 'viewer@finance.local',
    password: 'Viewer@123',
    role: USER_ROLES.VIEWER,
    status: USER_STATUS.ACTIVE,
  },
];

const generateRecords = (adminId) => [
  { amount: 85000, type: RECORD_TYPES.INCOME, category: 'Salary', date: '2025-01-03', description: 'Primary salary', createdBy: adminId, updatedBy: adminId },
  { amount: 12000, type: RECORD_TYPES.INCOME, category: 'Freelance', date: '2025-01-11', description: 'Website consulting', createdBy: adminId, updatedBy: adminId },
  { amount: 4000, type: RECORD_TYPES.INCOME, category: 'Investment', date: '2025-01-18', description: 'Mutual fund payout', createdBy: adminId, updatedBy: adminId },
  { amount: 6200, type: RECORD_TYPES.EXPENSE, category: 'Rent', date: '2025-01-05', description: 'Monthly rent', createdBy: adminId, updatedBy: adminId },
  { amount: 2400, type: RECORD_TYPES.EXPENSE, category: 'Food', date: '2025-01-08', description: 'Groceries', createdBy: adminId, updatedBy: adminId },
  { amount: 1200, type: RECORD_TYPES.EXPENSE, category: 'Transport', date: '2025-01-14', description: 'Fuel and metro', createdBy: adminId, updatedBy: adminId },
  { amount: 1800, type: RECORD_TYPES.EXPENSE, category: 'Utilities', date: '2025-01-16', description: 'Internet and electricity', createdBy: adminId, updatedBy: adminId },
  { amount: 1500, type: RECORD_TYPES.EXPENSE, category: 'Health', date: '2025-01-24', description: 'Medicines', createdBy: adminId, updatedBy: adminId },
  { amount: 2700, type: RECORD_TYPES.EXPENSE, category: 'Shopping', date: '2025-01-26', description: 'Clothing', createdBy: adminId, updatedBy: adminId },
  { amount: 2200, type: RECORD_TYPES.EXPENSE, category: 'Entertainment', date: '2025-01-29', description: 'Weekend outing', createdBy: adminId, updatedBy: adminId },
  { amount: 86000, type: RECORD_TYPES.INCOME, category: 'Salary', date: '2025-02-03', description: 'Primary salary', createdBy: adminId, updatedBy: adminId },
  { amount: 10000, type: RECORD_TYPES.INCOME, category: 'Freelance', date: '2025-02-10', description: 'Backend API project', createdBy: adminId, updatedBy: adminId },
  { amount: 5500, type: RECORD_TYPES.INCOME, category: 'Investment', date: '2025-02-20', description: 'Stock gains', createdBy: adminId, updatedBy: adminId },
  { amount: 6200, type: RECORD_TYPES.EXPENSE, category: 'Rent', date: '2025-02-05', description: 'Monthly rent', createdBy: adminId, updatedBy: adminId },
  { amount: 2600, type: RECORD_TYPES.EXPENSE, category: 'Food', date: '2025-02-09', description: 'Groceries', createdBy: adminId, updatedBy: adminId },
  { amount: 1400, type: RECORD_TYPES.EXPENSE, category: 'Transport', date: '2025-02-12', description: 'Taxi and fuel', createdBy: adminId, updatedBy: adminId },
  { amount: 1950, type: RECORD_TYPES.EXPENSE, category: 'Utilities', date: '2025-02-16', description: 'Bills', createdBy: adminId, updatedBy: adminId },
  { amount: 2300, type: RECORD_TYPES.EXPENSE, category: 'Education', date: '2025-02-21', description: 'Online course', createdBy: adminId, updatedBy: adminId },
  { amount: 1750, type: RECORD_TYPES.EXPENSE, category: 'Health', date: '2025-02-24', description: 'Health checkup', createdBy: adminId, updatedBy: adminId },
  { amount: 1250, type: RECORD_TYPES.EXPENSE, category: 'Miscellaneous', date: '2025-02-28', description: 'Misc costs', createdBy: adminId, updatedBy: adminId },
  { amount: 87500, type: RECORD_TYPES.INCOME, category: 'Salary', date: '2025-03-03', description: 'Primary salary', createdBy: adminId, updatedBy: adminId },
  { amount: 14000, type: RECORD_TYPES.INCOME, category: 'Freelance', date: '2025-03-10', description: 'Audit service', createdBy: adminId, updatedBy: adminId },
  { amount: 3000, type: RECORD_TYPES.INCOME, category: 'Investment', date: '2025-03-18', description: 'Dividend', createdBy: adminId, updatedBy: adminId },
  { amount: 6200, type: RECORD_TYPES.EXPENSE, category: 'Rent', date: '2025-03-05', description: 'Monthly rent', createdBy: adminId, updatedBy: adminId },
  { amount: 2550, type: RECORD_TYPES.EXPENSE, category: 'Food', date: '2025-03-09', description: 'Groceries', createdBy: adminId, updatedBy: adminId },
  { amount: 1550, type: RECORD_TYPES.EXPENSE, category: 'Transport', date: '2025-03-13', description: 'Fuel and metro', createdBy: adminId, updatedBy: adminId },
  { amount: 2050, type: RECORD_TYPES.EXPENSE, category: 'Utilities', date: '2025-03-17', description: 'Bills', createdBy: adminId, updatedBy: adminId },
  { amount: 1900, type: RECORD_TYPES.EXPENSE, category: 'Shopping', date: '2025-03-22', description: 'Home items', createdBy: adminId, updatedBy: adminId },
  { amount: 2600, type: RECORD_TYPES.EXPENSE, category: 'Entertainment', date: '2025-03-25', description: 'Concert', createdBy: adminId, updatedBy: adminId },
  { amount: 1300, type: RECORD_TYPES.EXPENSE, category: 'Miscellaneous', date: '2025-03-29', description: 'Misc costs', createdBy: adminId, updatedBy: adminId },
].map((item) => ({ ...item, date: new Date(item.date) }));

const seed = async () => {
  await connectDatabase();

  await User.deleteMany({});
  await FinancialRecord.deleteMany({});

  const users = await User.create(demoUsers);
  const admin = users.find((user) => user.role === USER_ROLES.ADMIN);

  if (!admin) {
    throw new Error('Admin user was not created');
  }

  await FinancialRecord.insertMany(generateRecords(admin._id));

  console.log('Seed completed successfully');
  console.log('Demo users:');
  console.log('admin@finance.local / Admin@123');
  console.log('analyst@finance.local / Analyst@123');
  console.log('viewer@finance.local / Viewer@123');

  await disconnectDatabase();
};

seed()
  .catch(async (error) => {
    console.error('Seed failed', error);
    if (mongoose.connection.readyState) {
      await disconnectDatabase();
    }
    process.exit(1);
  });
