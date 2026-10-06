import { create } from 'zustand';
import adminApi from '../services/adminApi';

export const useAdminAuthStore = create((set) => ({
  admin: JSON.parse(localStorage.getItem('adminUser')) || null,
  token: localStorage.getItem('adminToken') || null,
  isAuthenticated: !!localStorage.getItem('adminToken'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await adminApi.post('/auth/login', { email, password });
      const data = response.data;

      if (data.role !== 'admin') {
        throw new Error('Access denied: Admin permissions required.');
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data));

      set({
        admin: data,
        token: data.token,
        isAuthenticated: true,
        loading: false,
      });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Login failed',
        loading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    set({ admin: null, token: null, isAuthenticated: false });
  },
}));
