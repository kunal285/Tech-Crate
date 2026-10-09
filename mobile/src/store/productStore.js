import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import productService from '../services/productService';
import { FALLBACK_PRODUCTS } from '../data/fallbackData';

const useProductStore = create((set, get) => ({
  // State initialized with fallback data for immediate standalone rendering
  products: FALLBACK_PRODUCTS,
  trending: FALLBACK_PRODUCTS.slice(0, 4),
  recommended: FALLBACK_PRODUCTS.slice(2, 6),
  searchResults: [],
  currentProduct: null,
  categories: [],
  isLoading: false,
  isSearching: false,
  error: null,
  pagination: { page: 1, limit: 20, total: FALLBACK_PRODUCTS.length, hasMore: false },
  activeFilters: {},
  searchQuery: '',

  isLoadingTrending: false,
  trendingError: null,
  isLoadingRecommended: false,
  recommendedError: null,

  // Initialize cached products from AsyncStorage
  initCache: async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS_CACHE);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({
            products: parsed,
            trending: parsed.slice(0, 4),
            recommended: parsed.slice(2, 6),
          });
        }
      }
    } catch {}
  },

  // Fetch products with offline fallback & caching
  fetchProducts: async (params = {}, append = false) => {
    set({ isLoading: true, error: null });
    try {
      const result = await productService.getProducts(params);
      if (result.success) {
        const items = Array.isArray(result.data)
          ? result.data
          : result.data?.products || [];
        
        const newProducts = append ? [...get().products, ...items] : items;
        set(state => ({
          products: newProducts,
          pagination: result.data?.pagination || state.pagination,
          isLoading: false,
        }));

        // Cache fresh product list or clear cache if empty
        if (!append) {
          AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS_CACHE, JSON.stringify(items)).catch(() => {});
        }
        return result;
      } else {
        // Keep existing fallback/cached products
        set({ error: result.message, isLoading: false });
        return result;
      }
    } catch (err) {
      set({ error: err?.message, isLoading: false });
      return { success: false, data: get().products };
    }
  },

  // Fetch trending products with offline cache
  fetchTrending: async () => {
    set({ isLoadingTrending: true, trendingError: null });
    try {
      const result = await productService.getTrending(10);
      if (result.success) {
        const items = Array.isArray(result.data)
          ? result.data
          : result.data?.products || [];
        if (items.length > 0) {
          set({ trending: items, isLoadingTrending: false });
        } else {
          set({ isLoadingTrending: false });
        }
        return result;
      } else {
        set({ trendingError: result.message, isLoadingTrending: false });
        return result;
      }
    } catch (err) {
      set({ trendingError: err?.message, isLoadingTrending: false });
      return { success: false, data: get().trending };
    }
  },

  // Fetch recommended products
  fetchRecommended: async () => {
    set({ isLoadingRecommended: true, recommendedError: null });
    try {
      const result = await productService.getRecommended(10);
      if (result.success) {
        const items = Array.isArray(result.data)
          ? result.data
          : result.data?.products || [];
        if (items.length > 0) {
          set({ recommended: items, isLoadingRecommended: false });
        } else {
          set({ isLoadingRecommended: false });
        }
        return result;
      } else {
        set({ recommendedError: result.message, isLoadingRecommended: false });
        return result;
      }
    } catch (err) {
      set({ recommendedError: err?.message, isLoadingRecommended: false });
      return { success: false, data: get().recommended };
    }
  },

  // Fetch single product
  fetchProduct: async id => {
    set({ isLoading: true, currentProduct: null, error: null });
    // Check fallback/cached list first
    const existing = get().products.find(p => (p._id || p.id) === id);
    if (existing) {
      set({ currentProduct: existing, isLoading: false });
    }

    try {
      const result = await productService.getProduct(id);
      if (result.success && result.data?.product) {
        set({ currentProduct: result.data.product, isLoading: false });
        return result;
      }
    } catch {}

    if (existing) {
      return { success: true, data: { product: existing } };
    }
    set({ error: 'Product not found', isLoading: false });
    return { success: false };
  },

  // Search
  search: async (query, filters = {}) => {
    set({ isSearching: true, searchQuery: query, error: null });
    try {
      const result = await productService.searchProducts(query, filters);
      if (result.success) {
        set({
          searchResults: result.data.products || [],
          isSearching: false,
        });
        return result;
      }
    } catch {}

    // Offline local search fallback
    const q = (query || '').toLowerCase();
    const localFiltered = get().products.filter(
      p =>
        p.name?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
    set({ searchResults: localFiltered, isSearching: false });
    return { success: true, data: { products: localFiltered } };
  },

  // Set filters
  setFilters: filters => set({ activeFilters: filters }),
  clearFilters: () => set({ activeFilters: {} }),

  // Clear search
  clearSearch: () => set({ searchResults: [], searchQuery: '' }),

  clearError: () => set({ error: null }),
}));

// Initialize cache on startup
useProductStore.getState().initCache();

export { useProductStore };
export default useProductStore;
