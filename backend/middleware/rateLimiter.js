const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for Authentication endpoints (Login & Register)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login/registration attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Rate Limiter for Password Reset Requests
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many password reset requests from this IP. Please try again after an hour.',
  },
});

/**
 * Rate Limiter for Email Verification Resend
 */
const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many verification requests. Please try again after 15 minutes.',
  },
});

/**
 * Rate Limiter for General API Routes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP. Please slow down.',
  },
});

module.exports = {
  authLimiter,
  passwordResetLimiter,
  verificationLimiter,
  apiLimiter,
};
