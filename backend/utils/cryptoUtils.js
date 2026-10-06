const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

/**
 * Generate a cryptographically secure random token (hex string)
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a plain string/token using SHA-256
 */
const hashToken = (token) => {
  if (!token) return '';
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Validate password complexity:
 * - Minimum 8 characters
 * - Uppercase letter
 * - Lowercase letter
 * - Number
 * - Special character
 */
const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  return { isValid: true };
};

/**
 * Calculate password strength percentage (0 - 100)
 */
const getPasswordStrengthScore = (password) => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[a-z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;
  return score;
};

/**
 * Generate 2FA Secret and QR Code
 */
const generate2FASecret = async (email) => {
  const secret = speakeasy.generateSecret({
    name: `ProjectKart (${email})`,
    issuer: 'ProjectKart',
    length: 20,
  });

  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
  return {
    base32Secret: secret.base32,
    qrCodeUrl,
  };
};

/**
 * Verify 2FA TOTP Token
 */
const verify2FAToken = (base32Secret, token) => {
  return speakeasy.totp.verify({
    secret: base32Secret,
    encoding: 'base32',
    token: token,
    window: 1, // Allow 30 seconds clock drift
  });
};

/**
 * Generate cryptographically secure recovery codes
 */
const generateRecoveryCodes = (count = 10) => {
  const rawCodes = [];
  const hashedCodes = [];

  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 char hex e.g. "A1B2C3D4"
    const codeHash = hashToken(raw);
    rawCodes.push(raw);
    hashedCodes.push({ codeHash, used: false });
  }

  return { rawCodes, hashedCodes };
};

module.exports = {
  generateRandomToken,
  hashToken,
  validatePasswordStrength,
  getPasswordStrengthScore,
  generate2FASecret,
  verify2FAToken,
  generateRecoveryCodes,
};
