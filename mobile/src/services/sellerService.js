import {apiGet, apiPost, apiPut} from './api';

const sellerService = {
  // Get seller dashboard stats
  getDashboard: async () => {
    return await apiGet('/seller/dashboard');
  },

  // Get seller analytics
  getAnalytics: async (period = '30d') => {
    return await apiGet('/seller/analytics', {period});
  },

  // Get seller profile
  getProfile: async () => {
    return await apiGet('/seller/profile');
  },

  // Update seller profile
  updateProfile: async profileData => {
    return await apiPut('/seller/profile', profileData);
  },

  // Get seller products
  getProducts: async (params = {}) => {
    return await apiGet('/seller/products', params);
  },

  // Get seller orders
  getOrders: async (params = {}) => {
    return await apiGet('/seller/orders', params);
  },

  // Get seller reviews
  getReviews: async (params = {}) => {
    return await apiGet('/seller/reviews', params);
  },

  // Respond to review
  respondToReview: async (reviewId, response) => {
    return await apiPost(`/seller/reviews/${reviewId}/respond`, {response});
  },

  // Get inventory alerts
  getInventoryAlerts: async () => {
    return await apiGet('/seller/inventory/alerts');
  },

  // Bulk update inventory
  bulkUpdateInventory: async updates => {
    return await apiPut('/seller/inventory/bulk', {updates});
  },

  // Admin: Get all sellers
  getAllSellers: async (params = {}) => {
    return await apiGet('/admin/sellers', params);
  },

  // Admin: Approve seller
  approveSeller: async (sellerId, approved, reason = '') => {
    return await apiPut(`/admin/sellers/${sellerId}/approve`, {
      approved,
      reason,
    });
  },

  // Admin: Suspend seller
  suspendSeller: async (sellerId, reason) => {
    return await apiPut(`/admin/sellers/${sellerId}/suspend`, {reason});
  },
};

export { sellerService };
export default sellerService;
