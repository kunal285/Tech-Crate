import { apiGet } from './api';

const posterService = {
  /**
   * Fetch active promotional posters for mobile app hero carousel
   * Backend returns active posters ordered by displayOrder ASC
   */
  getActivePosters: async () => {
    try {
      const response = await apiGet('/posters/active');
      if (response && response.success !== false) {
        const list = response.data !== undefined ? response.data : response;
        return Array.isArray(list) ? list : [];
      }
      return [];
    } catch (error) {
      console.warn('[PosterService] Error fetching active posters:', error?.message);
      // Secondary fallback endpoint
      try {
        const fallback = await apiGet('/banners/active');
        if (fallback && fallback.success !== false) {
          const list = fallback.data !== undefined ? fallback.data : fallback;
          return Array.isArray(list) ? list : [];
        }
      } catch (fErr) {
        // silent fail
      }
      return [];
    }
  },
};

export default posterService;
