const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  generate2FA,
  verifyAndEnable2FA,
  disable2FA,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
  getSecurityLogs,
} = require('../controllers/authController');
const {
  sendOtp,
  verifyOtp,
  resendOtp,
} = require('../controllers/otpAuthController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const {
  authLimiter,
  passwordResetLimiter,
  verificationLimiter,
} = require('../middleware/rateLimiter');
const {
  validateRegistrationInput,
  validateLoginInput,
  validatePasswordResetInput,
} = require('../middleware/validationMiddleware');

// Customer & Student Passwordless OTP Authentication Endpoints
router.post('/send-otp', authLimiter, sendOtp);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/resend-otp', verificationLimiter, resendOtp);

// Standard Authentication & Account Management Endpoints
router.post('/register', authLimiter, validateRegistrationInput, registerUser);
router.post('/verify-email', verificationLimiter, verifyEmail);
router.post('/resend-verification', verificationLimiter, resendVerificationEmail);
router.post('/login', authLimiter, validateLoginInput, loginUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, validatePasswordResetInput, resetPassword);

// Protected Profile & Security Endpoints
router.post('/logout', optionalProtect, logoutUser);
router.get('/profile', protect, getUserProfile);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// 2FA Management Endpoints
router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verifyAndEnable2FA);
router.post('/2fa/disable', protect, disable2FA);

// Session Security & Security Audit Logs Endpoints
router.get('/security/sessions', protect, getActiveSessions);
router.delete('/security/sessions/:id', protect, revokeSession);
router.post('/security/sessions/revoke-all', protect, revokeAllSessions);
router.get('/security/logs', protect, getSecurityLogs);

module.exports = router;
