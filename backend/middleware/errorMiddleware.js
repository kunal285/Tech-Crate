const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Internal Server Error';
  let details = null;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    errorCode = 'RESOURCE_NOT_FOUND';
    message = `Resource not found: Invalid ${err.path}`;
    statusCode = 404;
  }

  // Handle Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    errorCode = 'DUPLICATE_RESOURCE';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
    statusCode = 400;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    errorCode = 'VALIDATION_FAILED';
    const validationErrors = Object.values(err.errors).map((val) => val.message);
    message = validationErrors.join(', ');
    details = validationErrors;
    statusCode = 400;
  }

  // Handle JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
    statusCode = 401;
  }

  // Use standardized res.error if responseEnvelope is active
  if (typeof res.error === 'function') {
    return res.error(errorCode, message, statusCode, details);
  }

  const requestId = req.requestId || 'req_unknown';
  return res.status(statusCode).json({
    error: {
      code: errorCode,
      message,
      requestId,
      ...(details ? { details } : {}),
      ...(process.env.NODE_ENV === 'production' ? {} : { stack: err.stack }),
    },
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Endpoint Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
