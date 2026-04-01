import { User } from '../models/User.js';
import { comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { USER_STATUS } from '../constants/status.js';

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(403, 'Your account is inactive');
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken({ sub: user._id.toString(), role: user.role });

  return {
    token,
    user: user.toSafeObject(),
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user.toSafeObject();
};
