import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';

export const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    return sendError(res, 400, 'Validation failed', errors);
  }

  return next();
};
