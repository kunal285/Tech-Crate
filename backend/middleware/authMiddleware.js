const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'TechCrate_jwt_secret_key_2026'
      );

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized: User account no longer exists.' });
      }

      // Check if account is locked or deactivated
      if (req.user.isLocked) {
        return res.status(423).json({ message: 'Account is temporarily locked. Please contact support.' });
      }

      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired. Please log in again.', expired: true });
      }
      return res.status(401).json({ message: 'Not authorized: Invalid authentication token.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized: No token provided.' });
  }
};

const authorizeRoles = (...roles) => {
  const normalizedAllowedRoles = roles.map((r) => r.toLowerCase());
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized: Authentication required.' });
    }

    const userRole = (req.user.role || 'customer').toLowerCase();
    const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin';

    // Super admin has permission for all admin routes
    if (normalizedAllowedRoles.includes(userRole) || (normalizedAllowedRoles.includes('admin') && isSuperAdmin)) {
      return next();
    }

    return res.status(403).json({
      message: `Access Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
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
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'TechCrate_jwt_secret_key_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Continue without user context if token expired or invalid
    }
  }
  next();
};

module.exports = { protect, optionalProtect, authorizeRoles };
