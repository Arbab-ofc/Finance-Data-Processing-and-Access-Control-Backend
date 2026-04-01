import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { loginUser, getCurrentUser } from '../services/authService.js';
import { env } from '../config/env.js';

export const login = asyncHandler(async (req, res) => {
  const data = await loginUser(req.body);
  res.cookie(env.authCookieName, data.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  });
  return sendSuccess(res, 'Login successful', data);
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);
  return sendSuccess(res, 'Profile fetched successfully', user);
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(env.authCookieName);
  return sendSuccess(res, 'Logout successful', null);
});
