import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  createUser,
  getUserById,
  listUsers,
  resetUserPassword,
  updateUser,
  updateUserRole,
  updateUserStatus,
} from '../services/userService.js';

export const createUserController = asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  return sendSuccess(res, 'User created successfully', user, 201);
});

export const listUsersController = asyncHandler(async (req, res) => {
  const { data, meta } = await listUsers(req.query);
  return sendSuccess(res, 'Users fetched successfully', data, 200, meta);
});

export const getUserController = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  return sendSuccess(res, 'User fetched successfully', user);
});

export const updateUserController = asyncHandler(async (req, res) => {
  const user = await updateUser(req.params.id, req.body);
  return sendSuccess(res, 'User updated successfully', user);
});

export const updateRoleController = asyncHandler(async (req, res) => {
  const user = await updateUserRole(req.params.id, req.body.role);
  return sendSuccess(res, 'User role updated successfully', user);
});

export const updateStatusController = asyncHandler(async (req, res) => {
  const user = await updateUserStatus(req.params.id, req.body.status, req.user.id);
  return sendSuccess(res, 'User status updated successfully', user);
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  const info = await resetUserPassword(req.params.id, req.body.password);
  return sendSuccess(res, 'User password reset successfully', info);
});
