const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { normalizeRole } = require('./rbacMiddleware');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[FATAL] JWT_SECRET is not configured in production environment.');
    }
    return 'dev_techcrate_jwt_secret_2026';
  }
  return secret;
};

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        if (typeof res.error === 'function') {
          return res.error('USER_NOT_FOUND', 'Not authorized: User account no longer exists.', 401);
        }
        return res.status(401).json({ message: 'Not authorized: User account no longer exists.' });
      }

      // Check if account is locked or deactivated
      if (req.user.isLocked) {
        if (typeof res.error === 'function') {
          return res.error('ACCOUNT_LOCKED', 'Account is temporarily locked. Please contact support.', 423);
        }
        return res.status(423).json({ message: 'Account is temporarily locked. Please contact support.' });
      }

      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        if (typeof res.error === 'function') {
          return res.error('TOKEN_EXPIRED', 'Session expired. Please log in again.', 401);
        }
        return res.status(401).json({ message: 'Session expired. Please log in again.', expired: true });
      }
      if (typeof res.error === 'function') {
        return res.error('INVALID_TOKEN', 'Not authorized: Invalid authentication token.', 401);
      }
      return res.status(401).json({ message: 'Not authorized: Invalid authentication token.' });
    }
  }

  if (!token) {
    if (typeof res.error === 'function') {
      return res.error('UNAUTHORIZED', 'Not authorized: No authentication token provided.', 401);
    }
    return res.status(401).json({ message: 'Not authorized: No token provided.' });
  }
};

const authorizeRoles = (...roles) => {
  const normalizedAllowedRoles = roles.map((r) => normalizeRole(r));
  return (req, res, next) => {
    if (!req.user) {
      if (typeof res.error === 'function') {
        return res.error('UNAUTHORIZED', 'Authentication required.', 401);
      }
      return res.status(401).json({ message: 'Not authorized: Authentication required.' });
    }

    const userRole = normalizeRole(req.user.role);
    const isSuperAdmin = userRole === 'super_admin';

    // Super admin has universal permission across all admin actions
    if (isSuperAdmin || normalizedAllowedRoles.includes(userRole)) {
      return next();
    }

    const message = `Access Forbidden: Role '${req.user.role || 'customer'}' is not authorized to access this resource.`;
    if (typeof res.error === 'function') {
      return res.error('FORBIDDEN', message, 403);
    }
    return res.status(403).json({
      message,
    });
  };
};

const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Continue without user context if token expired or invalid
    }
  }
  next();
};

module.exports = { protect, optionalProtect, authorizeRoles };
