const crypto = require('crypto');

/**
 * Standardized API Response & Request-ID Middleware
 * Injects a unique requestId into every request and adds response helper methods:
 * - res.success(data, meta, statusCode = 200) -> { data, meta: { requestId, timestamp, ...meta } }
 * - res.error(code, message, statusCode = 400, details = null) -> { error: { code, message, requestId, details } }
 */
const responseEnvelope = (req, res, next) => {
  // Capture or generate unique request identifier
  const requestId = req.headers['x-request-id'] || `req_${crypto.randomUUID()}`;
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Standardized Success Response Envelope
  res.success = function (data = null, meta = {}, statusCode = 200) {
    return res.status(statusCode).json({
      data: data !== null ? data : {},
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        ...meta,
      },
    });
  };

  // Standardized Error Response Envelope
  res.error = function (code = 'INTERNAL_ERROR', message = 'An error occurred', statusCode = 400, details = null) {
    const errorBody = {
      code,
      message,
      requestId,
    };
    if (details) {
      errorBody.details = details;
    }
    return res.status(statusCode).json({
      error: errorBody,
    });
  };

  next();
};

module.exports = responseEnvelope;
