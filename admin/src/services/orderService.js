import api from './api';

export const orderService = {
  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  updateOrderStatus: async (id, orderStatus) => {
    const response = await api.put(`/orders/${id}/status`, { orderStatus });
    return response.data;
  },
};
