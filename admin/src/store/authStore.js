import { create } from 'zustand';
import api from '../services/api';

const getInitialUser = () => {
  try {
    const stored = localStorage.getItem('adminUser');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: getInitialUser(),
  admin: getInitialUser(),
  token: localStorage.getItem('adminToken') || null,
  refreshToken: localStorage.getItem('adminRefreshToken') || null,
  isAuthenticated: !!localStorage.getItem('adminToken'),
  loading: false,
  error: null,
  require2FA: false,

  login: async (email, password, { totpCode, recoveryCode } = {}) => {
    set({ loading: true, error: null });
    try {
      const identifier = String(email || '').trim();
      const response = await api.post('/auth/login', {
        username: identifier,
        email: identifier,
        password,
        totpCode,
        recoveryCode,
      });

      const data = response.data;

      // Handle 2FA Challenge if configured
      if (data.require2FA) {
        set({
          require2FA: true,
          loading: false,
          error: data.message || 'Two-factor authentication code required.',
        });
        return false;
      }

      // Strict role check: Must be admin
      if (data.role !== 'admin') {
        throw new Error('Access Denied: Only Admin role can access this administrative console.');
      }

      localStorage.setItem('adminToken', data.token);
      if (data.refreshToken) {
        localStorage.setItem('adminRefreshToken', data.refreshToken);
      }
      localStorage.setItem('adminUser', JSON.stringify(data));

      set({
        user: data,
        admin: data,
        token: data.token,
        refreshToken: data.refreshToken || null,
        isAuthenticated: true,
        require2FA: false,
        loading: false,
        error: null,
      });
      return true;
    } catch (err) {
      let errorMsg =
        err.response?.data?.message || err.message;
      if (!err.response && (err.code === 'ECONNABORTED' || err.message === 'Network Error')) {
        errorMsg = 'Backend server is waking up or temporarily unreachable. Please wait 10 seconds and try again.';
      }
      set({
        error: errorMsg || 'Authentication failed. Please verify credentials.',
        loading: false,
      });
      return false;
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('adminRefreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {
        // Silent fallback
      }
    }

    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');

    set({
      user: null,
      admin: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      require2FA: false,
      loading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
