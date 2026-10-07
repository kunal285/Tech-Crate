const validator = require('validator');
const { validatePasswordStrength } = require('../utils/cryptoUtils');

/**
 * Middleware to validate Registration Request Body
 */
const validateRegistrationInput = (req, res, next) => {
  let { name, email, phone, mobile, password, confirmPassword } = req.body;
  const rawPhone = phone || mobile;

  if (!name || typeof name !== 'string' || validator.isEmpty(name.trim())) {
    return res.status(400).json({ message: 'Please provide a valid full name' });
  }

  if (!email || typeof email !== 'string' || !validator.isEmail(email.trim())) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (rawPhone) {
    const cleanDigits = String(rawPhone).replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number' });
    }
    req.body.phone = cleanDigits.slice(-10);
  }

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.isValid) {
    return res.status(400).json({ message: passwordCheck.message });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // Normalize and sanitize
  req.body.name = validator.escape(name.trim());
  req.body.email = validator.normalizeEmail(email.trim().toLowerCase());

  next();
};

/**
 * Middleware to validate Login Request Body (Supports Email or Mobile Number as Username)
 */
const validateLoginInput = (req, res, next) => {
  let { email, username, phone, password } = req.body;
  const identifier = String(username || email || phone || '').trim();

  if (!identifier) {
    return res.status(400).json({ message: 'Please provide mobile number or email.' });
  }

  if (!password || typeof password !== 'string' || validator.isEmpty(password)) {
    return res.status(400).json({ message: 'Please enter your password.' });
  }

  req.body.username = identifier;
  if (validator.isEmail(identifier)) {
    req.body.email = validator.normalizeEmail(identifier.toLowerCase());
  } else {
    const cleanDigits = identifier.replace(/\D/g, '');
    if (cleanDigits.length >= 10) {
      req.body.phone = cleanDigits.slice(-10);
    }
  }

  next();
};

/**
 * Middleware to validate Password Reset / Update Input
 */
const validatePasswordResetInput = (req, res, next) => {
  const { password } = req.body;
  const passwordCheck = validatePasswordStrength(password);

  if (!passwordCheck.isValid) {
    return res.status(400).json({ message: passwordCheck.message });
  }

  next();
};

module.exports = {
  validateRegistrationInput,
  validateLoginInput,
  validatePasswordResetInput,
};
