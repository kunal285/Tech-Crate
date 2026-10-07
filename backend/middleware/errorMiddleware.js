const { Sentry } = require('../config/sentry');

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Report 500 internal server exceptions to Sentry
  if (statusCode >= 500 && process.env.SENTRY_DSN) {
    try {
      Sentry.captureException(err);
    } catch (_) {}
  }

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    message = `Resource not found: Invalid ${err.path}`;
    statusCode = 404;
  }

  // Handle Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
    statusCode = 400;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    statusCode = 400;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authentication token';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Authentication token expired';
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Endpoint Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
