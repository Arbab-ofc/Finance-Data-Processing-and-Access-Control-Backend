import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { loginUser, getCurrentUser } from '../services/authService.js';

export const login = asyncHandler(async (req, res) => {
  const data = await loginUser(req.body);
  return sendSuccess(res, 'Login successful', data);
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);
  return sendSuccess(res, 'Profile fetched successfully', user);
});

export const logout = asyncHandler(async (req, res) => sendSuccess(res, 'Logout successful', null));
