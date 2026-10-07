import { Linking } from 'react-native';
import { apiGet, apiPost } from './api';

const paymentService = {
  // Create Order API (POST /api/orders/create)
  createOrder: async (orderData) => {
    return await apiPost('/orders/create', orderData);
  },

  // Create payment order alias (POST /api/payments/create-order)
  createPaymentOrder: async (orderData) => {
    return await apiPost('/payments/create-order', orderData);
  },

  // GET Server-Authoritative Payment Status (GET /api/payments/:order_id/status)
  getPaymentStatus: async (order_id) => {
    return await apiGet(`/payments/${order_id}/status`);
  },

  // Open Payment Gateway in native browser / intent URL
  openPaymentGateway: async (paymentUrl) => {
    if (!paymentUrl) {
      throw new Error('Invalid payment gateway URL.');
    }
    const canOpen = await Linking.canOpenURL(paymentUrl).catch(() => true);
    if (canOpen) {
      return await Linking.openURL(paymentUrl);
    } else {
      throw new Error('Unable to open payment browser.');
    }
  },

  // Get payment history
  getPaymentHistory: async (params = {}) => {
    return await apiGet('/payments/history', params);
  },
};

export { paymentService };
export default paymentService;
