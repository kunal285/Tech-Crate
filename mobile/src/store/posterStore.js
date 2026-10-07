import { create } from 'zustand';
import posterService from '../services/posterService';

const usePosterStore = create((set, get) => ({
  posters: [],
  isLoading: false,
  error: null,

  fetchPosters: async () => {
    // If posters already exist, don't flash a loading skeleton, fetch in background
    const hasExisting = get().posters.length > 0;
    if (!hasExisting) {
      set({ isLoading: true, error: null });
    }

    try {
      const data = await posterService.getActivePosters();
      if (Array.isArray(data) && data.length > 0) {
        set({ posters: data, isLoading: false, error: null });
      } else if (!hasExisting) {
        set({ posters: [], isLoading: false });
      }
      return data;
    } catch (err) {
      console.warn('[PosterStore] Fetch error:', err?.message);
      if (!hasExisting) {
        set({ error: err?.message || 'Failed to load promotional posters', isLoading: false });
      }
      return get().posters;
    }
  },
}));

export default usePosterStore;
