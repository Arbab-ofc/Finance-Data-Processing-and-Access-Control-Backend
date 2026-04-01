export const sendSuccess = (res, message, data = null, statusCode = 200, meta = undefined) => {
  const response = {
    success: true,
    message,
    data,
    requestId: res.locals?.requestId,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (res, statusCode, message, errors = undefined) => {
  const response = {
    success: false,
    message,
    requestId: res.locals?.requestId,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
