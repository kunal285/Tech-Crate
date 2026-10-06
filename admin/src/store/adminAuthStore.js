import { create } from 'zustand';
import adminApi from '../services/adminApi';

export const useAdminAuthStore = create((set) => ({
  admin: JSON.parse(localStorage.getItem('adminUser')) || null,
  token: localStorage.getItem('adminToken') || null,
  refreshToken: localStorage.getItem('adminRefreshToken') || null,
  isAuthenticated: !!localStorage.getItem('adminToken'),
  require2FA: false,
  loading: false,
  error: null,

  login: async ({ email, password, totpCode, recoveryCode }) => {
    set({ loading: true, error: null });
    try {
      const response = await adminApi.post('/auth/login', {
        email,
        password,
        totpCode,
        recoveryCode,
      });

      const data = response.data;

      // Handle 2FA prompt
      if (data.require2FA) {
        set({
          require2FA: true,
          loading: false,
          error: data.message || 'Two-factor authentication required.',
        });
        return false;
      }

      if (data.role !== 'admin') {
        throw new Error('Access denied: Admin permissions required.');
      }

      localStorage.setItem('adminToken', data.token);
      if (data.refreshToken) {
        localStorage.setItem('adminRefreshToken', data.refreshToken);
      }
      localStorage.setItem('adminUser', JSON.stringify(data));

      set({
        admin: data,
        token: data.token,
        refreshToken: data.refreshToken || null,
        isAuthenticated: true,
        require2FA: false,
        loading: false,
      });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Authentication failed',
        loading: false,
      });
      return false;
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('adminRefreshToken');
    if (refreshToken) {
      try {
        await adminApi.post('/auth/logout', { refreshToken });
      } catch (err) {
        // Silent logout fallback
      }
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    set({ admin: null, token: null, refreshToken: null, isAuthenticated: false, require2FA: false });
  },
}));
