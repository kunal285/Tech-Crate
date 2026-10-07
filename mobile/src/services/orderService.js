import {apiGet, apiPost, apiPut} from './api';

const orderService = {
  // Create order
  createOrder: async orderData => {
    return await apiPost('/orders', orderData);
  },

  // Get all orders
  getOrders: async (params = {}) => {
    return await apiGet('/orders', params);
  },

  // Alias for getting current user orders
  getMyOrders: async (params = {}) => {
    return await apiGet('/orders', params);
  },

  // Get single order
  getOrder: async orderId => {
    return await apiGet(`/orders/${orderId}`);
  },

  getOrderById: async orderId => {
    return await apiGet(`/orders/${orderId}`);
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    return await apiPost(`/orders/${orderId}/cancel`, {reason});
  },

  // Track order
  trackOrder: async orderId => {
    return await apiGet(`/orders/${orderId}/track`);
  },

  // Request return/refund
  requestReturn: async (orderId, items, reason) => {
    return await apiPost(`/orders/${orderId}/return`, {items, reason});
  },

  // Download invoice
  downloadInvoice: async orderId => {
    return await apiGet(`/orders/${orderId}/invoice`);
  },

  // Seller: Get orders
  getSellerOrders: async (params = {}) => {
    return await apiGet('/seller/orders', params);
  },

  // Seller: Update order status
  updateOrderStatus: async (orderId, status, note = '') => {
    return await apiPut(`/seller/orders/${orderId}/status`, {status, note});
  },

  // Admin: Get all orders
  getAllOrders: async (params = {}) => {
    return await apiGet('/admin/orders', params);
  },
};

export default orderService;
