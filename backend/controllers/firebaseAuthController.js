const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const SecurityLog = require('../models/SecurityLog');
const { hashToken } = require('../utils/cryptoUtils');
const firebaseAdmin = require('../config/firebaseAdmin');

const ACCESS_TOKEN_EXPIRE = '15m';
const REFRESH_TOKEN_DAYS = 7;

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
 * Clean and normalize phone number to standard 10-digit Indian format
 */
const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits.slice(-10);
};

/**
 * Extract token from either body or Authorization header
 */
const extractIdToken = (req) => {
  if (req && req.body && req.body.idToken) {
    return req.body.idToken;
  }
  const authHeader = req && req.headers && req.headers.authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

// ============================================================================
// FIREBASE AUTH CONTROLLER FOR CUSTOMERS & STUDENTS
// ============================================================================

/**
 * @desc Authenticate / Login Customer or Student using verified Firebase ID token
 * @route POST /api/auth/firebase-login
 */
const firebaseLogin = async (req, res) => {
  try {
    const idToken = extractIdToken(req);

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID Token is required. Please authenticate with Firebase Phone Auth first.',
      });
    }

    // 1. Server-side verification using Firebase Admin SDK
    let decoded;
    try {
      decoded = await firebaseAdmin.verifyFirebaseIdToken(idToken);
    } catch (verifyErr) {
      return res.status(401).json({
        success: false,
        message: verifyErr.message || 'Firebase ID token verification failed.',
      });
    }

    const { uid, phone_number: firebasePhone } = decoded;

    if (!firebasePhone) {
      return res.status(400).json({
        success: false,
        message: 'No verified phone number associated with this Firebase credential.',
      });
    }

    const cleanPhone = normalizePhone(firebasePhone);

    // 2. Lookup existing user by firebaseUid or phone
    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, { phone: cleanPhone }],
    });

    // 3. STRICT ADMIN ISOLATION GUARD
    if (user && user.role === 'admin') {
      await logSecurityEvent(user._id, 'FIREBASE_AUTH_FAILED', req, {
        reason: 'Attempted admin login via Customer Firebase Phone Auth endpoint',
        firebaseUid: uid,
      });
      return res.status(403).json({
        success: false,
        message: 'Admin accounts are isolated and cannot authenticate via Customer/Student Phone Auth. Use the dedicated Admin Console.',
      });
    }

    const { accountType, name, college, branch, studentId } = req.body;

    // 4. If account doesn't exist yet, create Customer or Student
    if (!user) {
      const targetRole = accountType === 'student' ? 'student' : 'customer';
      user = await User.create({
        name: name && name.trim() ? name.trim() : `User ${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        firebaseUid: uid,
        role: targetRole,
        college: college || '',
        branch: branch || '',
        studentId: studentId || '',
        isPhoneVerified: true,
      });
    } else {
      // User exists: update firebaseUid and phone verification
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
      }
      user.isPhoneVerified = true;
      if (college) user.college = college;
      if (branch) user.branch = branch;
      if (studentId) user.studentId = studentId;

      // Allow upgrade to student role if requested and valid
      if (accountType === 'student' && user.role !== 'student') {
        user.role = 'student';
      }

      user.lastLoginAt = new Date();
      await user.save();
    }

    // 5. Create secure TechCrate application session
    const rawRefreshToken = await createRefreshTokenSession(user, req);
    const accessToken = generateAccessToken(user._id);

    const actionType = user.role === 'student' ? 'STUDENT_LOGIN' : 'CUSTOMER_LOGIN';
    await logSecurityEvent(user._id, actionType, req, {
      firebaseUid: uid,
      method: 'FIREBASE_PHONE_AUTH',
    });

    res.json({
      success: true,
      message: 'Authenticated successfully with Firebase Phone Auth.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email || '',
        phone: user.phone,
        role: user.role, // strictly 'customer' or 'student'
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
    console.error('[Firebase Login Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Firebase login failed due to a server error.',
    });
  }
};

/**
 * @desc Register Customer or Student using verified Firebase ID token
 * @route POST /api/auth/firebase-register
 */
const firebaseRegister = async (req, res) => {
  try {
    const idToken = extractIdToken(req);

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID Token is required. Please verify phone number first.',
      });
    }

    // 1. Server-side verification using Firebase Admin SDK
    let decoded;
    try {
      decoded = await firebaseAdmin.verifyFirebaseIdToken(idToken);
    } catch (verifyErr) {
      return res.status(401).json({
        success: false,
        message: verifyErr.message || 'Firebase ID token verification failed.',
      });
    }

    const { uid, phone_number: firebasePhone } = decoded;
    const cleanPhone = normalizePhone(firebasePhone);

    const { name, email, accountType, college, branch, studentId } = req.body;

    // 2. Check for existing account
    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, { phone: cleanPhone }],
    });

    if (user) {
      // Enforce Admin Isolation
      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin accounts cannot be registered or modified via this endpoint.',
        });
      }

      // Existing user: gracefully log them in
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
      }
      user.isPhoneVerified = true;
      if (name && name.trim()) user.name = name.trim();
      if (email && email.trim()) user.email = email.trim().toLowerCase();
      if (college) user.college = college;
      if (branch) user.branch = branch;
      if (studentId) user.studentId = studentId;
      if (accountType === 'student') user.role = 'student';

      user.lastLoginAt = new Date();
      await user.save();
    } else {
      // 3. New User Registration
      // STRICT ROLE ENFORCEMENT: Only 'customer' or 'student' permitted
      const targetRole = accountType === 'student' ? 'student' : 'customer';

      user = await User.create({
        name: name && name.trim() ? name.trim() : `User ${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        email: email && email.trim() ? email.trim().toLowerCase() : undefined,
        firebaseUid: uid,
        role: targetRole,
        college: college || '',
        branch: branch || '',
        studentId: studentId || '',
        isPhoneVerified: true,
      });
    }

    // 4. Create application session
    const rawRefreshToken = await createRefreshTokenSession(user, req);
    const accessToken = generateAccessToken(user._id);

    const actionType = user.role === 'student' ? 'STUDENT_LOGIN' : 'CUSTOMER_LOGIN';
    await logSecurityEvent(user._id, actionType, req, {
      firebaseUid: uid,
      method: 'FIREBASE_REGISTER',
    });

    res.json({
      success: true,
      message: 'Account registered and authenticated successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email || '',
        phone: user.phone,
        role: user.role,
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
    console.error('[Firebase Register Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Firebase registration failed due to a server error.',
    });
  }
};

module.exports = {
  firebaseLogin,
  firebaseRegister,
};
