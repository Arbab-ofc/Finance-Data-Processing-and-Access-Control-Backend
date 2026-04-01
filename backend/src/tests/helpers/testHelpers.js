import { User } from '../../models/User.js';
import { FinancialRecord } from '../../models/FinancialRecord.js';
import { USER_ROLES } from '../../constants/roles.js';
import { USER_STATUS } from '../../constants/status.js';
import { RECORD_TYPES } from '../../constants/finance.js';
import { generateToken } from '../../utils/jwt.js';

export const createUserFixture = async (overrides = {}) => {
  const user = await User.create({
    name: 'Test User',
    email: `user_${Date.now()}_${Math.random().toString(16).slice(2)}@test.local`,
    password: 'Password@123',
    role: USER_ROLES.VIEWER,
    status: USER_STATUS.ACTIVE,
    ...overrides,
  });

  return user;
};

export const createUsersByRole = async () => {
  const admin = await createUserFixture({ name: 'Admin Test', email: 'admin@test.local', role: USER_ROLES.ADMIN });
  const analyst = await createUserFixture({ name: 'Analyst Test', email: 'analyst@test.local', role: USER_ROLES.ANALYST });
  const viewer = await createUserFixture({ name: 'Viewer Test', email: 'viewer@test.local', role: USER_ROLES.VIEWER });
  const inactive = await createUserFixture({ name: 'Inactive Test', email: 'inactive@test.local', status: USER_STATUS.INACTIVE });

  return { admin, analyst, viewer, inactive };
};

export const authHeader = (user) => ({ Authorization: `Bearer ${generateToken({ sub: user._id.toString(), role: user.role })}` });

export const createRecordFixture = async (overrides = {}) => {
  if (!overrides.createdBy) {
    throw new Error('createdBy is required for createRecordFixture');
  }

  return FinancialRecord.create({
    amount: 1200,
    type: RECORD_TYPES.EXPENSE,
    category: 'Food',
    date: new Date('2025-01-10'),
    description: 'Test record',
    updatedBy: overrides.createdBy,
    ...overrides,
  });
};
