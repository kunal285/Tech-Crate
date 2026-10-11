/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces granular administrative permissions across:
 * - super_admin: Complete access across all settings, staff, data, and finances
 * - store_manager: Catalogue, categories, inventory, promotions, banners
 * - order_staff: Order management, fulfillment, packaging, shipment creation
 * - support: Customer details, order inquiries, reviews, return/replacement claims
 * - finance: Payment reconciliation, refunds, tax/sales reports
 */

const ROLE_PERMISSIONS = {
  super_admin: [
    'catalog:manage',
    'inventory:manage',
    'orders:manage',
    'orders:read',
    'shipments:manage',
    'customers:read',
    'promotions:manage',
    'reviews:manage',
    'finance:manage',
    'finance:read',
    'staff:manage',
    'system:manage',
  ],
  store_manager: [
    'catalog:manage',
    'inventory:manage',
    'orders:read',
    'promotions:manage',
    'reviews:manage',
  ],
  order_staff: [
    'orders:read',
    'orders:manage',
    'shipments:manage',
    'inventory:read',
  ],
  support: [
    'customers:read',
    'orders:read',
    'reviews:manage',
    'returns:manage',
  ],
  finance: [
    'orders:read',
    'finance:manage',
    'finance:read',
  ],
};

/**
 * Normalizes user role string. Maps legacy 'admin' to 'super_admin'.
 */
const normalizeRole = (role) => {
  if (!role) return 'customer';
  const lower = String(role).toLowerCase().trim();
  if (lower === 'admin') return 'super_admin';
  return lower;
};

/**
 * Middleware factory to authorize specific roles.
 * Usage: requireRoles('super_admin', 'store_manager')
 */
const requireRoles = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));

  return (req, res, next) => {
    if (!req.user) {
      if (typeof res.error === 'function') {
        return res.error('UNAUTHORIZED', 'Authentication is required to access this resource.', 401);
      }
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.', requestId: req.requestId },
      });
    }

    const userRole = normalizeRole(req.user.role);

    // Super admin has universal bypass
    if (userRole === 'super_admin' || normalizedAllowed.includes(userRole)) {
      return next();
    }

    const message = `Forbidden: Role '${req.user.role || 'customer'}' does not have permission for this action.`;
    if (typeof res.error === 'function') {
      return res.error('FORBIDDEN', message, 403);
    }
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message, requestId: req.requestId },
    });
  };
};

/**
 * Middleware factory to check specific capability permission.
 * Usage: requirePermission('catalog:manage')
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      if (typeof res.error === 'function') {
        return res.error('UNAUTHORIZED', 'Authentication is required.', 401);
      }
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.', requestId: req.requestId },
      });
    }

    const userRole = normalizeRole(req.user.role);
    if (userRole === 'super_admin') {
      return next();
    }

    const permissions = ROLE_PERMISSIONS[userRole] || [];
    if (permissions.includes(permission)) {
      return next();
    }

    const message = `Forbidden: Role '${req.user.role}' lacks the required '${permission}' permission.`;
    if (typeof res.error === 'function') {
      return res.error('FORBIDDEN', message, 403);
    }
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message, requestId: req.requestId },
    });
  };
};

module.exports = {
  ROLE_PERMISSIONS,
  normalizeRole,
  requireRoles,
  requirePermission,
};
