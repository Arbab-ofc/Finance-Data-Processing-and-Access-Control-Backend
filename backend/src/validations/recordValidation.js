import { body, query } from 'express-validator';

import { RECORD_TYPE_VALUES, RECORD_CATEGORIES } from '../constants/finance.js';

export const createRecordValidation = [
  body('amount').isFloat({ gt: 0 }).withMessage('amount must be a positive number'),
  body('type').isIn(RECORD_TYPE_VALUES).withMessage(`type must be one of: ${RECORD_TYPE_VALUES.join(', ')}`),
  body('category').isIn(RECORD_CATEGORIES).withMessage('category is invalid'),
  body('date').isISO8601().withMessage('date must be a valid date'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('description cannot exceed 500 characters'),
];

export const updateRecordValidation = [
  body('amount').optional().isFloat({ gt: 0 }).withMessage('amount must be a positive number'),
  body('type').optional().isIn(RECORD_TYPE_VALUES).withMessage(`type must be one of: ${RECORD_TYPE_VALUES.join(', ')}`),
  body('category').optional().isIn(RECORD_CATEGORIES).withMessage('category is invalid'),
  body('date').optional().isISO8601().withMessage('date must be a valid date'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('description cannot exceed 500 characters'),
];

export const listRecordValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('type').optional().isIn(RECORD_TYPE_VALUES).withMessage(`type must be one of: ${RECORD_TYPE_VALUES.join(', ')}`),
  query('category').optional().isIn(RECORD_CATEGORIES).withMessage('category is invalid'),
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
  query('minAmount').optional().isFloat({ gt: 0 }).withMessage('minAmount must be a positive number'),
  query('maxAmount').optional().isFloat({ gt: 0 }).withMessage('maxAmount must be a positive number'),
  query('sortBy').optional().isIn(['amount', 'date', 'category', 'type', 'createdAt']).withMessage('sortBy is invalid'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
  query('endDate')
    .optional()
    .custom((endDate, { req }) => {
      if (!req.query.startDate || !endDate) {
        return true;
      }

      const start = new Date(req.query.startDate);
      const end = new Date(endDate);
      if (end < start) {
        throw new Error('endDate must be greater than or equal to startDate');
      }
      return true;
    }),
  query('maxAmount')
    .optional()
    .custom((maxAmount, { req }) => {
      if (!req.query.minAmount || !maxAmount) {
        return true;
      }

      if (Number(maxAmount) < Number(req.query.minAmount)) {
        throw new Error('maxAmount must be greater than or equal to minAmount');
      }

      return true;
    }),
];
