import { create } from 'zustand';

const isClient = typeof window !== 'undefined';

const getInitialUser = () => {
  if (!isClient) return null;
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
  isAuthenticated: isClient ? !!localStorage.getItem('adminUser') : false,
  loading: false,
  error: null,
  require2FA: false,

  login: async (email, password, { totpCode, recoveryCode } = {}) => {
    set({ loading: true, error: null });
    try {
      const identifier = String(email || '').trim();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: identifier,
          email: identifier,
          password,
          totpCode,
          recoveryCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Authentication failed');
      }

      if (data.require2FA) {
        set({
          require2FA: true,
          loading: false,
          error: data.message || 'Two-factor authentication code required.',
        });
        return false;
      }

      const userData = data.user || data;
      if (isClient) {
        localStorage.setItem('adminUser', JSON.stringify(userData));
      }

      set({
        user: userData,
        admin: userData,
        isAuthenticated: true,
        require2FA: false,
        loading: false,
        error: null,
      });
      return true;
    } catch (err) {
      set({
        error: err.message || 'Authentication failed. Please check credentials.',
        loading: false,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // silent fallback
    }

    if (isClient) {
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
    }

    set({
      user: null,
      admin: null,
      isAuthenticated: false,
      require2FA: false,
      loading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
