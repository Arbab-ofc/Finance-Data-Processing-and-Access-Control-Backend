import { query } from 'express-validator';

export const recentActivityValidation = [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
];

export const trendsValidation = [
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
  query('endDate')
    .optional()
    .custom((endDate, { req }) => {
      if (!req.query.startDate || !endDate) {
        return true;
      }

      if (new Date(endDate) < new Date(req.query.startDate)) {
        throw new Error('endDate must be greater than or equal to startDate');
      }
      return true;
    }),
];
