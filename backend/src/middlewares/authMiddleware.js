import { User } from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { USER_STATUS } from '../constants/status.js';

const extractToken = (req) => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }

  if (req.cookies?.token) {
    return req.cookies.token;
  }

  return null;
};

export const authenticate = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return next(new ApiError(401, 'Authentication token is required'));
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub).select('+password');

    if (!user) {
      return next(new ApiError(401, 'Invalid authentication token'));
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      return next(new ApiError(403, 'Your account is inactive'));
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid authentication token'));
  }
};
