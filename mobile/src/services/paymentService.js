import {apiGet, apiPost} from './api';

const paymentService = {
  // Create Razorpay order
  createRazorpayOrder: async orderData => {
    return await apiPost('/payments/create-order', orderData);
  },

  // Verify payment on backend
  verifyPayment: async paymentData => {
    return await apiPost('/payments/verify', paymentData);
  },

  // Get payment details
  getPayment: async paymentId => {
    return await apiGet(`/payments/${paymentId}`);
  },

  // Get payment history
  getPaymentHistory: async (params = {}) => {
    return await apiGet('/payments/history', params);
  },

  // Request refund
  requestRefund: async (paymentId, amount, reason) => {
    return await apiPost(`/payments/${paymentId}/refund`, {amount, reason});
  },

  // Build Razorpay options from order
  buildRazorpayOptions: (razorpayOrder, user, description = 'ProjectKart Purchase') => {
    return {
      description,
      image: 'https://your-logo-url.com/logo.png',
      currency: razorpayOrder.currency || 'INR',
      key: razorpayOrder.key_id,
      amount: razorpayOrder.amount,
      name: 'ProjectKart',
      order_id: razorpayOrder.id,
      prefill: {
        email: user.email,
        contact: user.phone || '',
        name: user.name,
      },
      theme: {color: '#1E3A5F'},
    };
  },
};

export default paymentService;
