const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for OTP Send Endpoint (Strict - Max 5 per phone per 10 mins)
 */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    keyGeneratorIpFallback: false,
    xForwardedForHeader: false,
    default: true,
  },
  keyGenerator: (req) => {
    // Limit by IP + phone number combination
    const phone = (req.body?.phoneNumber || '').replace(/\D/g, '').slice(-10);
    return `${req.ip}_${phone}`;
  },
  message: {
    success: false,
    message: 'Too many OTP requests from this number. Please wait 10 minutes before requesting again.',
  },
});

/**
 * Rate Limiter for Authentication endpoints (Login & Register)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Rate Limiter for Password Reset Requests
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests from this IP. Please try again after an hour.',
  },
});

/**
 * Rate Limiter for Email Verification Resend
 */
const verificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification requests. Please try again after 10 minutes.',
  },
});

/**
 * Rate Limiter for General API Routes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please slow down.',
  },
});

/**
 * Rate Limiter for Checkout & Payment Endpoints
 */
const checkoutLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many order requests. Please wait a few minutes before placing another order.',
  },
});

module.exports = {
  otpLimiter,
  authLimiter,
  passwordResetLimiter,
  verificationLimiter,
  apiLimiter,
  checkoutLimiter,
};
