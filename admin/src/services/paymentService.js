import api from './api';

export const paymentService = {
  getPayments: async () => {
    const response = await api.get('/admin/payments');
    return response.data;
  },
};
