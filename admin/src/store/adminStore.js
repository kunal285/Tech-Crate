import { create } from 'zustand';
import { analyticsService } from '../services/analyticsService';

export const useAdminStore = create((set) => ({
  stats: null,
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true });
    try {
      const data = await analyticsService.getStats();
      set({ stats: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));
