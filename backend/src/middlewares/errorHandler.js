import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

const formatValidationErrors = (errors) => errors.map((err) => ({
  field: err.path,
  message: err.message,
}));

export const notFoundHandler = (req, res) => {
  sendError(res, 404, `Route not found: ${req.originalUrl}`);
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ValidationError') {
    return sendError(res, 400, 'Validation failed', formatValidationErrors(Object.values(err.errors)));
  }

  if (err instanceof mongoose.Error.CastError) {
    return sendError(res, 400, 'Invalid identifier supplied', [{ field: err.path, message: 'Invalid ObjectId' }]);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return sendError(res, 409, 'Duplicate value error', [{ field, message: `${field} already exists` }]);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const payload = env.nodeEnv === 'production' && statusCode === 500
    ? sendError(res, statusCode, 'Internal server error')
    : sendError(res, statusCode, message, err.errors);

  return payload;
};
