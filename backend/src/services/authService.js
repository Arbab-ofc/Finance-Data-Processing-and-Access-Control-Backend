import { User } from '../models/User.js';
import { comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { USER_STATUS } from '../constants/status.js';
import { AUTH_MESSAGES } from '../constants/messages.js';
import { serializeUser } from '../utils/serializers.js';

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = typeof email === 'string' ? email.toLowerCase() : '';
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    throw new ApiError(401, AUTH_MESSAGES.INVALID_CREDENTIALS);
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(403, AUTH_MESSAGES.INACTIVE_ACCOUNT);
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, AUTH_MESSAGES.INVALID_CREDENTIALS);
  }

  const token = generateToken({ sub: user._id.toString(), role: user.role });

  return {
    token,
    user: serializeUser(user),
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return serializeUser(user);
};
