import {create} from 'zustand';
import productService from '../services/productService';

const useProductStore = create((set, get) => ({
  // State
  products: [],
  trending: [],
  recommended: [],
  searchResults: [],
  currentProduct: null,
  categories: [],
  isLoading: false,
  isSearching: false,
  error: null,
  pagination: {page: 1, limit: 20, total: 0, hasMore: true},
  activeFilters: {},
  searchQuery: '',

  isLoadingTrending: false,
  trendingError: null,
  isLoadingRecommended: false,
  recommendedError: null,

  // Fetch products
  fetchProducts: async (params = {}, append = false) => {
    set({isLoading: true, error: null});
    const result = await productService.getProducts(params);
    if (result.success) {
      const items = Array.isArray(result.data)
        ? result.data
        : (result.data?.products || []);
      set(state => ({
        products: append ? [...state.products, ...items] : items,
        pagination: result.data?.pagination || state.pagination,
        isLoading: false,
      }));
    } else {
      set({error: result.message, isLoading: false});
    }
    return result;
  },

  // Fetch trending products
  fetchTrending: async () => {
    set({isLoadingTrending: true, trendingError: null});
    const result = await productService.getTrending(10);
    if (result.success) {
      const items = Array.isArray(result.data)
        ? result.data
        : (result.data?.products || []);
      set({trending: items, isLoadingTrending: false});
    } else {
      set({trendingError: result.message, isLoadingTrending: false});
    }
    return result;
  },

  // Fetch recommended
  fetchRecommended: async () => {
    set({isLoadingRecommended: true, recommendedError: null});
    const result = await productService.getRecommended(10);
    if (result.success) {
      const items = Array.isArray(result.data)
        ? result.data
        : (result.data?.products || []);
      set({recommended: items, isLoadingRecommended: false});
    } else {
      set({recommendedError: result.message, isLoadingRecommended: false});
    }
    return result;
  },

  // Fetch single product
  fetchProduct: async id => {
    set({isLoading: true, currentProduct: null, error: null});
    const result = await productService.getProduct(id);
    if (result.success) {
      set({currentProduct: result.data.product, isLoading: false});
    } else {
      set({error: result.message, isLoading: false});
    }
    return result;
  },

  // Search
  search: async (query, filters = {}) => {
    set({isSearching: true, searchQuery: query, error: null});
    const result = await productService.searchProducts(query, filters);
    if (result.success) {
      set({
        searchResults: result.data.products || [],
        isSearching: false,
      });
    } else {
      set({error: result.message, isSearching: false});
    }
    return result;
  },

  // Set filters
  setFilters: filters => set({activeFilters: filters}),
  clearFilters: () => set({activeFilters: {}}),

  // Clear search
  clearSearch: () => set({searchResults: [], searchQuery: ''}),

  clearError: () => set({error: null}),
}));

export { useProductStore };
export default useProductStore;
