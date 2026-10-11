import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import posterService from '../services/posterService';
import { FALLBACK_POSTERS } from '../data/fallbackData';

const usePosterStore = create((set, get) => ({
  posters: FALLBACK_POSTERS,
  isLoading: false,
  error: null,

  initCache: async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.POSTERS_CACHE);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ posters: parsed });
        }
      }
    } catch {}
  },

  fetchPosters: async () => {
    const hasExisting = get().posters.length > 0;
    if (!hasExisting) {
      set({ isLoading: true, error: null });
    }

    try {
      const data = await posterService.getActivePosters();
      if (Array.isArray(data) && data.length > 0) {
        set({ posters: data, isLoading: false, error: null });
        AsyncStorage.setItem(STORAGE_KEYS.POSTERS_CACHE, JSON.stringify(data)).catch(() => {});
      } else if (!hasExisting) {
        set({ posters: FALLBACK_POSTERS, isLoading: false });
      }
      return data;
    } catch (err) {
      console.warn('[PosterStore] Fetch error:', err?.message);
      if (!hasExisting) {
        set({ posters: FALLBACK_POSTERS, error: null, isLoading: false });
      }
      return get().posters;
    }
  },
}));

// Initialize cache on startup
usePosterStore.getState().initCache();

export { usePosterStore };
export default usePosterStore;
