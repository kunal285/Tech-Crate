const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const SecurityLog = require('../models/SecurityLog');
const {
  generateRandomToken,
  hashToken,
  validatePasswordStrength,
  generate2FASecret,
  verify2FAToken,
  generateRecoveryCodes,
} = require('../utils/cryptoUtils');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSecurityAlertEmail,
} = require('../services/emailService');

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
 * Generate and record Refresh Token in Database
 */
const createRefreshTokenSession = async (user, req) => {
  const rawRefreshToken = generateRandomToken(40);
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
 * Log Security Activity Event
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

// ============================================================================
// 1. REGISTRATION & EMAIL VERIFICATION
// ============================================================================

// @desc Register new user with name, mobile no, email, password policy
// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, mobile, password, role, college, branch, firebaseUid } = req.body;
    const rawPhone = phone || mobile;
    const cleanPhone = rawPhone ? String(rawPhone).replace(/\D/g, '').slice(-10) : null;
    const cleanEmail = String(email || '').trim().toLowerCase();

    // Protection against duplicate accounts (check both email and mobile)
    const duplicateQueries = [{ email: cleanEmail }];
    if (cleanPhone) {
      duplicateQueries.push({ phone: cleanPhone });
      duplicateQueries.push({ phone: `+91${cleanPhone}` });
    }

    const existingUser = await User.findOne({ $or: duplicateQueries });
    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return res.status(400).json({ message: 'An account with this email address already exists.' });
      }
      return res.status(400).json({ message: 'An account with this mobile number already exists.' });
    }

    // Generate cryptographic verification token
    const rawVerificationToken = generateRandomToken(32);
    const tokenHash = hashToken(rawVerificationToken);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone ? (cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10)) : undefined,
      firebaseUid: firebaseUid || undefined,
      password,
      role: role && ['customer', 'student', 'seller'].includes(role) ? role : 'customer',
      college: college || '',
      branch: branch || '',
      isEmailVerified: true,
      isPhoneVerified: !!cleanPhone,
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email in background (optional/non-blocking)
    sendVerificationEmail(user.email, rawVerificationToken).catch(() => { });
    await logSecurityEvent(user._id, 'REGISTER_SUCCESS', req);

    // Issue tokens so user is immediately logged in upon registration
    const rawRefreshToken = await createRefreshTokenSession(user, req);
    const accessToken = generateAccessToken(user._id);

    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      college: user.college,
      branch: user.branch,
      isEmailVerified: user.isEmailVerified,
    };

    res.status(201).json({
      message: 'Account created successfully!',
      user: userPayload,
      token: accessToken,
      refreshToken: rawRefreshToken,
    });
  } catch (error) {
    console.error('[Registration Error]', error);
    res.status(500).json({ message: 'Registration failed due to a server error. Please try again.' });
  }
};

// @desc Verify Email Address with Token
// @route POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const hashed = hashToken(token);
    const user = await User.findOne({
      emailVerificationTokenHash: hashed,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationTokenHash +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired email verification token.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    await logSecurityEvent(user._id, 'EMAIL_VERIFIED', req);

    res.json({ message: 'Email address verified successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Email verification failed.' });
  }
};

// @desc Resend Verification Email
// @route POST /api/auth/resend-verification
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+emailVerificationTokenHash +emailVerificationExpires'
    );

    if (user && !user.isEmailVerified) {
      const rawToken = generateRandomToken(32);
      user.emailVerificationTokenHash = hashToken(rawToken);
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      await sendVerificationEmail(user.email, rawToken);
      await logSecurityEvent(user._id, 'VERIFICATION_EMAIL_SENT', req);
    }

    // Generic safe response to prevent account enumeration
    res.json({ message: 'If an unverified account exists for this email, a verification link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to resend verification email.' });
  }
};

// ============================================================================
// 2. AUTHENTICATION & LOGIN SYSTEM
// ============================================================================

// @desc Auth user with mobile number or email as username, password, handle 2FA, lockout & issue tokens
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { username, email, phone, password, totpCode, recoveryCode } = req.body;
    const identifier = String(username || email || phone || '').trim();

    if (!identifier) {
      return res.status(400).json({ message: 'Please provide mobile number or email.' });
    }

    const cleanDigits = identifier.replace(/\D/g, '');
    let searchConditions = [];

    if (identifier.toLowerCase() === 'admin') {
      searchConditions.push({ role: 'admin' });
      searchConditions.push({ email: 'admin@techcrate.com' });
    } else if (identifier.includes('@')) {
      searchConditions.push({ email: identifier.toLowerCase() });
    } else if (cleanDigits.length >= 10) {
      const tenDigits = cleanDigits.slice(-10);
      searchConditions.push({ phone: tenDigits });
      searchConditions.push({ phone: `+91${tenDigits}` });
      searchConditions.push({ phone: cleanDigits });
    } else {
      searchConditions.push({ email: identifier.toLowerCase() });
      searchConditions.push({ phone: identifier });
    }

    const user = await User.findOne({ $or: searchConditions }).select('+password +twoFactorSecret +twoFactorRecoveryCodes');

    // Generic response against account enumeration
    if (!user) {
      return res.status(401).json({ message: 'Invalid mobile/email or password.' });
    }

    // Check account lockout
    if (user.isLocked) {
      const remainingMins = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      await logSecurityEvent(user._id, 'LOGIN_FAILED', req, { reason: 'Account locked' });
      return res.status(423).json({
        message: `Account is temporarily locked due to failed login attempts. Try again in ${remainingMins} minutes.`,
      });
    }

    // Verify Password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;

      // Lock account after 5 failed attempts for 15 minutes
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await logSecurityEvent(user._id, 'ACCOUNT_LOCKED', req);
      }
      await user.save();

      await logSecurityEvent(user._id, 'LOGIN_FAILED', req, { attempts: user.failedLoginAttempts });
      return res.status(401).json({ message: 'Invalid mobile/email or password.' });
    }

    // Check Two-Factor Authentication (2FA) if enabled
    if (user.twoFactorEnabled) {
      if (!totpCode && !recoveryCode) {
        return res.json({
          require2FA: true,
          message: 'Two-factor authentication code required.',
        });
      }

      let is2FAValid = false;

      if (totpCode && user.twoFactorSecret) {
        is2FAValid = verify2FAToken(user.twoFactorSecret, totpCode);
      }

      // Check backup recovery code if TOTP failed or not provided
      if (!is2FAValid && recoveryCode) {
        const hashedReqCode = hashToken(recoveryCode.trim().toUpperCase());
        const matchedCode = user.twoFactorRecoveryCodes.find(
          (c) => c.codeHash === hashedReqCode && !c.used
        );

        if (matchedCode) {
          is2FAValid = true;
          matchedCode.used = true; // Burn single-use code
          await user.save();
          await logSecurityEvent(user._id, 'MFA_VERIFIED', req, { method: 'recovery_code' });
        }
      }

      if (!is2FAValid) {
        await logSecurityEvent(user._id, 'LOGIN_FAILED', req, { reason: 'Invalid 2FA code' });
        return res.status(401).json({ message: 'Invalid two-factor authentication code or recovery code.' });
      }
    }

    // Reset failed attempts on success
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    // Create Refresh Token Session
    const rawRefreshToken = await createRefreshTokenSession(user, req);
    const accessToken = generateAccessToken(user._id);

    await logSecurityEvent(user._id, 'LOGIN_SUCCESS', req);

    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      college: user.college,
      branch: user.branch,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    };

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      ...userPayload,
      user: userPayload,
      token: accessToken,
      refreshToken: rawRefreshToken,
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ message: 'Login failed due to a server error.' });
  }
};

// @desc Google & Social Authentication (Login & Registration)
// @route POST /api/auth/social-auth & POST /api/auth/google-login
const socialAuth = async (req, res) => {
  try {
    let { provider = 'google', email, name, photoUrl, idToken, credential, role } = req.body;

    // 1. If Google JWT credential/idToken is provided (Google Identity Services / One Tap / Mobile)
    const rawToken = credential || idToken;
    let googleSub = null;

    if (rawToken) {
      try {
        const decoded = jwt.decode(rawToken);
        if (decoded && decoded.email) {
          email = decoded.email;
          name = decoded.name || name;
          photoUrl = decoded.picture || photoUrl;
          googleSub = decoded.sub;
          provider = 'google';
        }
      } catch (tokenErr) {
        console.warn('[Google Token Decode Warning]', tokenErr.message);
      }
    }

    if (!provider || !['google', 'facebook'].includes(provider.toLowerCase())) {
      return res.status(400).json({ message: 'Valid provider (google or facebook) is required.' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Email address is required for social authentication.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    
    // Find existing user by googleId, email, or firebaseUid
    let user = await User.findOne({
      $or: [
        ...(googleSub ? [{ googleId: googleSub }] : []),
        { email: cleanEmail },
      ],
    });

    if (!user) {
      // Auto-register new user via Google / Social auth
      const providerTitle = provider.toLowerCase() === 'google' ? 'Google' : 'Facebook';
      user = await User.create({
        name: (name && name.trim()) || `${providerTitle} User`,
        email: cleanEmail,
        googleId: googleSub || undefined,
        avatar: photoUrl || undefined,
        role: role && ['customer', 'student'].includes(role) ? role : 'customer',
        isEmailVerified: true,
      });
      await logSecurityEvent(user._id, 'SOCIAL_REGISTER_SUCCESS', req, { provider });
    } else {
      // User exists: update Google ID, avatar and email verification
      let needsSave = false;
      if (googleSub && !user.googleId) {
        user.googleId = googleSub;
        needsSave = true;
      }
      if (photoUrl && (!user.avatar || user.avatar.includes('unsplash'))) {
        user.avatar = photoUrl;
        needsSave = true;
      }
      if (!user.isEmailVerified && provider.toLowerCase() === 'google') {
        user.isEmailVerified = true;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
      await logSecurityEvent(user._id, 'SOCIAL_LOGIN_SUCCESS', req, { provider });
    }

    const rawRefreshToken = await createRefreshTokenSession(user, req);
    const accessToken = generateAccessToken(user._id);

    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      college: user.college,
      branch: user.branch,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    };

    res.json({
      success: true,
      message: `Successfully authenticated with ${provider}`,
      ...userPayload,
      user: userPayload,
      token: accessToken,
      refreshToken: rawRefreshToken,
    });
  } catch (error) {
    console.error('[Social Auth Error]', error);
    res.status(500).json({ message: 'Social authentication failed. Please try again.' });
  }
};

// @desc Refresh Access Token with Token Rotation & Reuse Detection
// @route POST /api/auth/refresh-token
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required.' });
    }

    const hashed = hashToken(refreshToken);
    const existingSession = await RefreshToken.findOne({ tokenHash: hashed });

    // Token Reuse Detection
    if (!existingSession) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    if (existingSession.isRevoked) {
      // Compromised session detected! Revoke all user sessions for safety.
      await RefreshToken.updateMany({ user: existingSession.user }, { isRevoked: true });
      await logSecurityEvent(existingSession.user, 'ALL_SESSIONS_REVOKED', req, {
        reason: 'Token reuse detected',
      });
      return res.status(401).json({ message: 'Security alert: Token reuse detected. All sessions revoked.' });
    }

    if (existingSession.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Refresh token expired. Please log in again.' });
    }

    // Rotate Refresh Token
    const newRawRefreshToken = generateRandomToken(40);
    const newTokenHash = hashToken(newRawRefreshToken);

    existingSession.isRevoked = true;
    existingSession.replacedByTokenHash = newTokenHash;
    await existingSession.save();

    await RefreshToken.create({
      user: existingSession.user,
      tokenHash: newTokenHash,
      deviceInfo: req.headers['user-agent'] || 'Unknown Client Device',
      ipAddress: req.ip || 'Unknown IP',
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
    });

    const newAccessToken = generateAccessToken(existingSession.user);

    res.json({
      token: newAccessToken,
      refreshToken: newRawRefreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to refresh session.' });
  }
};

// @desc Logout user (Revoke current session)
// @route POST /api/auth/logout
const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    let userId = req.user ? req.user._id : null;

    if (refreshToken) {
      const hashed = hashToken(refreshToken);
      const tokenDoc = await RefreshToken.findOneAndUpdate(
        { tokenHash: hashed },
        { isRevoked: true }
      );
      if (tokenDoc && !userId) {
        userId = tokenDoc.user;
      }
    }

    if (userId) {
      await RefreshToken.updateMany({ user: userId }, { isRevoked: true });
      await logSecurityEvent(userId, 'SESSION_REVOKED', req);
    }

    res.clearCookie('token', { path: '/' });
    res.clearCookie('auth_token', { path: '/' });

    res.json({ success: true, message: 'Logged out successfully. Session invalidated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed.' });
  }
};

// ============================================================================
// 3. PASSWORD RESET & PROFILE MANAGEMENT
// ============================================================================

// @desc Forgot Password Request
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+passwordResetTokenHash +passwordResetExpires'
    );

    if (user) {
      const rawResetToken = generateRandomToken(32);
      user.passwordResetTokenHash = hashToken(rawResetToken);
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      await user.save();

      await sendPasswordResetEmail(user.email, rawResetToken);
      await logSecurityEvent(user._id, 'PASSWORD_RESET_REQUESTED', req);
    }

    // Generic safe response prevents email enumeration
    res.json({
      message: 'If an account exists for this email, you will receive password-reset instructions.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to process password reset request.' });
  }
};

// @desc Reset Password with Token
// @route POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Reset token is required.' });
    }

    const hashed = hashToken(token);
    const user = await User.findOne({
      passwordResetTokenHash: hashed,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetTokenHash +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Revoke all existing active sessions on password reset
    await RefreshToken.updateMany({ user: user._id }, { isRevoked: true });

    await sendSecurityAlertEmail(
      user.email,
      'Password Changed',
      'Your TechCrate account password was successfully reset. All active sessions have been revoked.'
    );
    await logSecurityEvent(user._id, 'PASSWORD_RESET_COMPLETED', req);

    res.json({ message: 'Password reset successfully! Please log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed.' });
  }
};

// @desc Get Logged in User Profile
// @route GET /api/auth/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      college: user.college,
      branch: user.branch,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user profile.' });
  }
};

// @desc Update Profile & Password
// @route PUT /api/auth/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.college !== undefined) user.college = req.body.college;
    if (req.body.branch !== undefined) user.branch = req.body.branch;

    // Change Password requires current password verification
    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ message: 'Current password is required to update password.' });
      }

      const isCurrentValid = await user.matchPassword(req.body.currentPassword);
      if (!isCurrentValid) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }

      const passCheck = validatePasswordStrength(req.body.newPassword);
      if (!passCheck.isValid) {
        return res.status(400).json({ message: passCheck.message });
      }

      user.password = req.body.newPassword;
      await sendSecurityAlertEmail(user.email, 'Password Updated', 'Your account password was updated successfully.');
      await logSecurityEvent(user._id, 'PASSWORD_CHANGED', req);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      college: updatedUser.college,
      branch: updatedUser.branch,
      isEmailVerified: updatedUser.isEmailVerified,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      token: generateAccessToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed.' });
  }
};

// ============================================================================
// 4. TWO-FACTOR AUTHENTICATION (TOTP 2FA)
// ============================================================================

// @desc Generate 2FA Secret & QR Code
// @route POST /api/auth/2fa/generate
const generate2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { base32Secret, qrCodeUrl } = await generate2FASecret(user.email);

    // Temporarily save secret until verified
    user.twoFactorSecret = base32Secret;
    await user.save();

    res.json({
      secret: base32Secret,
      qrCodeUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate 2FA secret.' });
  }
};

// @desc Verify & Enable 2FA with initial recovery codes
// @route POST /api/auth/2fa/verify
const verifyAndEnable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret +twoFactorRecoveryCodes');

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA generation not initiated.' });
    }

    const isValid = verify2FAToken(user.twoFactorSecret, token);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid 2FA token code.' });
    }

    const { rawCodes, hashedCodes } = generateRecoveryCodes(10);

    user.twoFactorEnabled = true;
    user.twoFactorRecoveryCodes = hashedCodes;
    await user.save();

    await logSecurityEvent(user._id, 'MFA_ENABLED', req);
    await sendSecurityAlertEmail(user.email, '2FA Enabled', 'Two-Factor Authentication is now enabled on your account.');

    res.json({
      message: 'Two-factor authentication enabled successfully!',
      recoveryCodes: rawCodes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify and enable 2FA.' });
  }
};

// @desc Disable 2FA
// @route POST /api/auth/2fa/disable
const disable2FA = async (req, res) => {
  try {
    const { currentPassword, token } = req.body;
    const user = await User.findById(req.user._id).select('+password +twoFactorSecret +twoFactorRecoveryCodes');

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled on this account.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is required to disable 2FA.' });
    }

    const is2FAValid = verify2FAToken(user.twoFactorSecret, token);
    if (!is2FAValid) {
      return res.status(400).json({ message: 'Invalid 2FA token code.' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorRecoveryCodes = [];
    await user.save();

    await logSecurityEvent(user._id, 'MFA_DISABLED', req);
    await sendSecurityAlertEmail(user.email, '2FA Disabled', 'Two-Factor Authentication has been disabled on your account.');

    res.json({ message: 'Two-factor authentication disabled.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disable 2FA.' });
  }
};

// ============================================================================
// 5. ACCOUNT SECURITY DASHBOARD & SESSIONS
// ============================================================================

// @desc Get Active Sessions
// @route GET /api/auth/security/sessions
const getActiveSessions = async (req, res) => {
  try {
    const sessions = await RefreshToken.find({
      user: req.user._id,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).sort({ updatedAt: -1 });

    const currentTokenHash = req.body.refreshToken ? hashToken(req.body.refreshToken) : null;

    const formattedSessions = sessions.map((s) => ({
      _id: s._id,
      deviceInfo: s.deviceInfo,
      ipAddress: s.ipAddress,
      lastActive: s.updatedAt,
      isCurrent: currentTokenHash ? s.tokenHash === currentTokenHash : false,
    }));

    res.json(formattedSessions);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch active sessions.' });
  }
};

// @desc Revoke Specific Session (IDOR Protected)
// @route DELETE /api/auth/security/sessions/:id
const revokeSession = async (req, res) => {
  try {
    const session = await RefreshToken.findById(req.params.id);

    // IDOR Protection: Verify session belongs to logged in user
    if (!session || session.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    session.isRevoked = true;
    await session.save();

    await logSecurityEvent(req.user._id, 'SESSION_REVOKED', req, { sessionId: session._id });

    res.json({ message: 'Session revoked successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to revoke session.' });
  }
};

// @desc Revoke All Other Sessions
// @route POST /api/auth/security/sessions/revoke-all
const revokeAllSessions = async (req, res) => {
  try {
    await RefreshToken.updateMany({ user: req.user._id }, { isRevoked: true });
    await logSecurityEvent(req.user._id, 'ALL_SESSIONS_REVOKED', req);

    res.json({ message: 'All active sessions revoked successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to revoke all sessions.' });
  }
};

// @desc Get Security Activity Logs
// @route GET /api/auth/security/logs
const getSecurityLogs = async (req, res) => {
  try {
    const logs = await SecurityLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch security logs.' });
  }
};

module.exports = {
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
  socialAuth,
};
