import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { hashPassword } from '../utils/password.js';
import { buildPagination } from '../utils/pagination.js';
import { normalizePaginationQuery } from '../utils/query.js';
import { serializeUser } from '../utils/serializers.js';

export const createUser = async (payload) => {
  const existing = await User.findOne({ email: payload.email.toLowerCase() });

  if (existing) {
    throw new ApiError(409, 'Duplicate value error', [{ field: 'email', message: 'email already exists' }]);
  }

  const user = await User.create({
    ...payload,
    email: payload.email.toLowerCase(),
  });

  return serializeUser(user);
};

export const listUsers = async (query) => {
  const { page, limit, skip } = normalizePaginationQuery(query);

  const filter = {};

  if (query.role) {
    filter.role = query.role;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const sortBy = query.sortBy || 'createdAt';
  const order = query.order === 'asc' ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ [sortBy]: order }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    data: users.map((user) => serializeUser(user)),
    meta: buildPagination({ page, limit, total }),
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return serializeUser(user);
};

export const updateUser = async (userId, payload) => {
  if (payload.email) {
    const duplicate = await User.findOne({ email: payload.email.toLowerCase(), _id: { $ne: userId } });

    if (duplicate) {
      throw new ApiError(409, 'Duplicate value error', [{ field: 'email', message: 'email already exists' }]);
    }

    payload.email = payload.email.toLowerCase();
  }

  const user = await User.findByIdAndUpdate(userId, payload, { returnDocument: 'after', runValidators: true });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return serializeUser(user);
};

export const updateUserRole = async (userId, role) => {
  const user = await User.findByIdAndUpdate(userId, { role }, { returnDocument: 'after', runValidators: true });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return serializeUser(user);
};

export const updateUserStatus = async (userId, status, actorId) => {
  if (actorId && actorId === userId && status === 'inactive') {
    throw new ApiError(400, 'Admin cannot deactivate own account');
  }

  const user = await User.findByIdAndUpdate(userId, { status }, { returnDocument: 'after', runValidators: true });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return serializeUser(user);
};

export const resetUserPassword = async (userId, password) => {
  const hashed = await hashPassword(password);
  const user = await User.findByIdAndUpdate(userId, { password: hashed }, { returnDocument: 'after', runValidators: false }).select('+password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return { id: user._id.toString() };
};
