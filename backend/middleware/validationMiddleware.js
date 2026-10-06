const validator = require('validator');
const { validatePasswordStrength } = require('../utils/cryptoUtils');

/**
 * Middleware to validate Registration Request Body
 */
const validateRegistrationInput = (req, res, next) => {
  let { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || validator.isEmpty(name.trim())) {
    return res.status(400).json({ message: 'Please provide a valid full name' });
  }

  if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.isValid) {
    return res.status(400).json({ message: passwordCheck.message });
  }

  // Normalize and sanitize
  req.body.name = validator.escape(name.trim());
  req.body.email = validator.normalizeEmail(email.trim().toLowerCase());

  next();
};

/**
 * Middleware to validate Login Request Body
 */
const validateLoginInput = (req, res, next) => {
  let { email, password } = req.body;

  if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  if (!password || typeof password !== 'string' || validator.isEmpty(password)) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  req.body.email = validator.normalizeEmail(email.trim().toLowerCase());
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
