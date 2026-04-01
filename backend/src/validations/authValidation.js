import { body } from 'express-validator';

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];
