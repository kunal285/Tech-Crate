import api from './api';

export const sellerService = {
  getSellers: async () => {
    const response = await api.get('/admin/sellers');
    return response.data;
  },
  approveSeller: async (id) => {
    const response = await api.put(`/admin/sellers/${id}/approve`);
    return response.data;
  },
  rejectSeller: async (id) => {
    const response = await api.put(`/admin/sellers/${id}/reject`);
    return response.data;
  },
};
