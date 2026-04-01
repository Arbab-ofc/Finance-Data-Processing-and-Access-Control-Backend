import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { hashPassword } from '../utils/password.js';
import { buildPagination } from '../utils/pagination.js';

export const createUser = async (payload) => {
  const existing = await User.findOne({ email: payload.email.toLowerCase() });

  if (existing) {
    throw new ApiError(409, 'Duplicate value error', [{ field: 'email', message: 'email already exists' }]);
  }

  const user = await User.create({
    ...payload,
    email: payload.email.toLowerCase(),
  });

  return user.toSafeObject();
};

export const listUsers = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

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
    data: users.map((user) => user.toSafeObject()),
    meta: buildPagination({ page, limit, total }),
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user.toSafeObject();
};

export const updateUser = async (userId, payload) => {
  if (payload.email) {
    const duplicate = await User.findOne({ email: payload.email.toLowerCase(), _id: { $ne: userId } });

    if (duplicate) {
      throw new ApiError(409, 'Duplicate value error', [{ field: 'email', message: 'email already exists' }]);
    }

    payload.email = payload.email.toLowerCase();
  }

  const user = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user.toSafeObject();
};

export const updateUserRole = async (userId, role) => {
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user.toSafeObject();
};

export const updateUserStatus = async (userId, status) => {
  const user = await User.findByIdAndUpdate(userId, { status }, { new: true, runValidators: true });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user.toSafeObject();
};

export const resetUserPassword = async (userId, password) => {
  const hashed = await hashPassword(password);
  const user = await User.findByIdAndUpdate(userId, { password: hashed }, { new: true, runValidators: false }).select('+password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return { id: user._id.toString() };
};
