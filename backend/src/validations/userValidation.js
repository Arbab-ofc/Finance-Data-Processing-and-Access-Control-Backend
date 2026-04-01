import { body, query } from 'express-validator';

import { USER_ROLE_VALUES } from '../constants/roles.js';
import { USER_STATUS_VALUES } from '../constants/status.js';
import { USER_SORT_FIELDS } from '../constants/sortFields.js';

export const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('role').isIn(USER_ROLE_VALUES).withMessage(`Role must be one of: ${USER_ROLE_VALUES.join(', ')}`),
  body('status').optional().isIn(USER_STATUS_VALUES).withMessage(`Status must be one of: ${USER_STATUS_VALUES.join(', ')}`),
];

export const updateUserValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required'),
];

export const updateRoleValidation = [
  body('role').isIn(USER_ROLE_VALUES).withMessage(`Role must be one of: ${USER_ROLE_VALUES.join(', ')}`),
];

export const updateStatusValidation = [
  body('status').isIn(USER_STATUS_VALUES).withMessage(`Status must be one of: ${USER_STATUS_VALUES.join(', ')}`),
];

export const resetPasswordValidation = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

export const listUsersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('role').optional().isIn(USER_ROLE_VALUES).withMessage(`role must be one of: ${USER_ROLE_VALUES.join(', ')}`),
  query('status').optional().isIn(USER_STATUS_VALUES).withMessage(`status must be one of: ${USER_STATUS_VALUES.join(', ')}`),
  query('sortBy').optional().isIn(USER_SORT_FIELDS).withMessage('sortBy is invalid'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
];
