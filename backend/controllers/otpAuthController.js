const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OtpChallenge = require('../models/OtpChallenge');
const RefreshToken = require('../models/RefreshToken');
const SecurityLog = require('../models/SecurityLog');
const { hashToken } = require('../utils/cryptoUtils');
const { sendOtpSMS, maskPhoneNumber } = require('../services/smsService');

const ACCESS_TOKEN_EXPIRE = '15m';
const REFRESH_TOKEN_DAYS = 7;
const OTP_VALID_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 30;

/**
 * Generate Access Token (JWT)
 */
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'TechCrate_jwt_secret_key_2026', {
    expiresIn: ACCESS_TOKEN_EXPIRE,
  });
};

/**
 * Create Refresh Token Session in Database
 */
const createRefreshTokenSession = async (user, req) => {
  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
  const deviceInfo = req.headers['user-agent'] || 'Unknown Client Device';

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    deviceInfo,
    ipAddress,
    expiresAt,
  });

  return rawRefreshToken;
};

/**
 * Log Security Audit Event
 */
const logSecurityEvent = async (userId, action, req, metadata = {}) => {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown Client';

    await SecurityLog.create({
      user: userId,
      action,
      ipAddress,
      userAgent,
      metadata,
    });
  } catch (err) {
    console.error('[Security Log Error]', err.message);
  }
};

/**
 * Clean phone number to standard 10-digit Indian mobile format
 */
const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits.slice(-10);
};

// ============================================================================
// PASSWORDLESS OTP CONTROLLER FOR CUSTOMERS & STUDENTS
// ============================================================================

// @desc Send 6-Digit SMS OTP to Customer / Student mobile number
// @route POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const cleanPhone = normalizePhone(phoneNumber);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number.',
      });
    }

    // Check 30-Second Resend Cooldown
    const recentChallenge = await OtpChallenge.findOne({
      phoneNumber: cleanPhone,
      used: false,
      createdAt: { $gt: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) },
    });

    if (recentChallenge) {
      const waitSeconds = Math.ceil(
        (recentChallenge.createdAt.getTime() + RESEND_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000
      );
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
        cooldownSeconds: waitSeconds,
      });
    }

    // Invalidate any previous unused challenges for this phone
    await OtpChallenge.updateMany(
      { phoneNumber: cleanPhone, used: false },
      { used: true }
    );

    // Generate cryptographically secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashToken(rawOtp);
    const requestId = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + OTP_VALID_MINUTES * 60 * 1000);

    // Save OtpChallenge record in database
    const challenge = await OtpChallenge.create({
      phoneNumber: cleanPhone,
      otpHash,
      requestId,
      expiresAt,
    });

    // Send real SMS through configured provider (Twilio / Fast2SMS / MSG91)
    try {
      await sendOtpSMS(cleanPhone, rawOtp);
    } catch (smsError) {
      // Clean up challenge if SMS sending failed so user is not stuck
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return res.status(400).json({
        success: false,
        message: smsError.message || 'Failed to dispatch SMS OTP.',
        error: smsError.message,
      });
    }

    const user = await User.findOne({ phone: cleanPhone });
    if (user) {
      await logSecurityEvent(user._id, 'OTP_SENT', req, { phone: maskPhoneNumber(cleanPhone) });
    }

    res.json({
      success: true,
      message: 'OTP has been dispatched to your mobile number.',
      maskedPhone: maskPhoneNumber(cleanPhone),
      requestId,
      expiresAt,
      cooldownSeconds: RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP due to a server error.',
    });
  }
};

// @desc Verify 6-Digit OTP and authenticate Customer or Student
// @route POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const {
      phoneNumber,
      otp,
      requestId,
      name,
      email,
      accountType,
      college,
      branch,
      studentId,
    } = req.body;
    const cleanPhone = normalizePhone(phoneNumber);

    if (!cleanPhone || !otp || !requestId) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number, 6-digit OTP, and Request ID are required.',
      });
    }

    const challenge = await OtpChallenge.findOne({
      phoneNumber: cleanPhone,
      requestId,
      used: false,
    });

    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: 'OTP challenge is invalid or has already been used. Please request a new OTP.',
      });
    }

    // Strict 5-Minute Expiry Check
    if (challenge.expiresAt < new Date()) {
      challenge.used = true;
      await challenge.save();
      return res.status(400).json({
        success: false,
        message: 'OTP has expired (validity is 5 minutes). Please request a new code.',
      });
    }

    // Rate Limit Attempt Check (Max 5 attempts)
    if (challenge.attemptCount >= 5) {
      challenge.used = true;
      await challenge.save();
      return res.status(400).json({
        success: false,
        message: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new code.',
      });
    }

    // SHA-256 OTP Hash Verification
    const inputHash = hashToken(String(otp).trim());
    if (inputHash !== challenge.otpHash) {
      challenge.attemptCount += 1;
      if (challenge.attemptCount >= 5) {
        challenge.used = true;
      }
      await challenge.save();

      return res.status(400).json({
        success: false,
        message: challenge.used
          ? 'Too many incorrect attempts. This OTP has been invalidated.'
          : 'Invalid OTP code. Please check and try again.',
        remainingAttempts: Math.max(0, 5 - challenge.attemptCount),
      });
    }

    // Single-use enforcement: Mark OTP Challenge as used immediately
    challenge.used = true;
    await challenge.save();

    // Check for existing account
    let user = await User.findOne({ phone: cleanPhone });

    // CRITICAL ADMIN ISOLATION CHECK
    if (user && user.role === 'admin') {
      await logSecurityEvent(user._id, 'LOGIN_FAILED', req, {
        reason: 'Attempted admin login via Customer OTP endpoint',
      });
      return res.status(403).json({
        success: false,
        message: 'Admin accounts are isolated and cannot authenticate via Customer OTP. Use the dedicated Admin Console.',
      });
    }

    // Determine target role (Only 'student' or 'customer' permitted)
    const targetRole = accountType === 'student' ? 'student' : 'customer';

    if (!user) {
      user = await User.create({
        name: name ? name.trim() : `User ${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        email: email ? email.trim().toLowerCase() : undefined,
        role: targetRole,
        college: college || '',
        branch: branch || '',
        studentId: studentId || '',
        isPhoneVerified: true,
      });
    } else {
      user.isPhoneVerified = true;
      if (college) user.college = college;
      if (branch) user.branch = branch;
      if (studentId) user.studentId = studentId;
      if (accountType === 'student' && user.role !== 'student') {
        user.role = 'student';
      }
      user.lastLoginAt = new Date();
      await user.save();
    }

    // Generate JWT Access Token and Refresh Session
    const rawRefreshToken = await createRefreshTokenSession(user, req);
    const accessToken = generateAccessToken(user._id);

    const actionType = user.role === 'student' ? 'STUDENT_LOGIN' : 'CUSTOMER_LOGIN';
    await logSecurityEvent(user._id, actionType, req);

    res.json({
      success: true,
      message: 'OTP verified successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email || '',
        phone: user.phone,
        role: user.role, // 'customer' or 'student'
        avatar: user.avatar,
        college: user.college,
        branch: user.branch,
        studentId: user.studentId,
        isPhoneVerified: user.isPhoneVerified,
      },
      token: accessToken,
      refreshToken: rawRefreshToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'OTP verification failed due to a server error.',
    });
  }
};

// @desc Resend OTP to Customer / Student
// @route POST /api/auth/resend-otp
const resendOtp = async (req, res) => {
  return sendOtp(req, res);
};

module.exports = {
  sendOtp,
  verifyOtp,
  resendOtp,
};
