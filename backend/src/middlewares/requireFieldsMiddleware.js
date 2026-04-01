import { ApiError } from '../utils/apiError.js';

export const requireAtLeastOneField = (fields) => (req, res, next) => {
  const hasAny = fields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field));

  if (!hasAny) {
    return next(new ApiError(400, `At least one of these fields is required: ${fields.join(', ')}`));
  }

  return next();
};
