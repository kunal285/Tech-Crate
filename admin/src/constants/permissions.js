// Tech Crate Admin Role-to-Permission Mapping
// Shared across middleware, Sidebar navigation, and route guards

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  STORE_MANAGER: 'store_manager',
  ORDER_STAFF: 'order_staff',
  SUPPORT: 'support',
  FINANCE: 'finance',
  // Legacy backward-compatibility mapping
  ADMIN: 'admin',
};

// Route prefixes allowed per role
export const ROLE_ROUTE_PERMISSIONS = {
  super_admin: [
    '/',
    '/dashboard',
    '/users',
    '/sellers',
    '/products',
    '/categories',
    '/projects',
    '/project-kits',
    '/orders',
    '/payments',
    '/reviews',
    '/coupons',
    '/banners',
    '/notifications',
    '/analytics',
    '/settings',
    '/replacements',
    '/ui-kit',
  ],
  admin: [
    // Legacy string equivalent to super_admin
    '/',
    '/dashboard',
    '/users',
    '/sellers',
    '/products',
    '/categories',
    '/projects',
    '/project-kits',
    '/orders',
    '/payments',
    '/reviews',
    '/coupons',
    '/banners',
    '/notifications',
    '/analytics',
    '/settings',
    '/replacements',
    '/ui-kit',
  ],
  store_manager: [
    '/',
    '/dashboard',
    '/products',
    '/categories',
    '/projects',
    '/project-kits',
    '/coupons',
    '/banners',
    '/reviews',
    '/analytics',
  ],
  order_staff: [
    '/',
    '/dashboard',
    '/orders',
    '/replacements',
  ],
  support: [
    '/',
    '/dashboard',
    '/orders',
    '/replacements',
    '/reviews',
    '/users',
  ],
  finance: [
    '/',
    '/dashboard',
    '/orders',
    '/payments',
    '/analytics',
  ],
};

/**
 * Check if a given role is allowed to access a specific path
 * @param {string} role - The user's role string
 * @param {string} pathname - The route pathname to check
 * @returns {boolean}
 */
export function isRouteAllowed(role, pathname) {
  if (!role) return false;
  const canonicalRole = role.toLowerCase().trim();
  const allowedRoutes = ROLE_ROUTE_PERMISSIONS[canonicalRole];
  if (!allowedRoutes) return false;

  // Exact match or prefix match (e.g. /products/create matches /products)
  return allowedRoutes.some((route) => {
    if (route === '/') return pathname === '/' || pathname === '/dashboard';
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}
