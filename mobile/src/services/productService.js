import {apiGet, apiPost, apiPut, apiDelete, apiUpload} from './api';
import {PAGINATION} from '../constants';

const productService = {
  // Get all products with pagination & filters
  getProducts: async (params = {}) => {
    const queryParams = {
      page: params.page || PAGINATION.DEFAULT_PAGE,
      limit: params.limit || PAGINATION.PRODUCTS_LIMIT,
      ...params,
    };
    return await apiGet('/products', queryParams);
  },

  // Get single product
  getProduct: async id => {
    return await apiGet(`/products/${id}`);
  },

  // Search products
  searchProducts: async (query, filters = {}) => {
    return await apiGet('/products/search', {q: query, ...filters});
  },

  // Get products by category
  getByCategory: async (categoryId, params = {}) => {
    return await apiGet(`/products/category/${categoryId}`, params);
  },

  // Get trending products
  getTrending: async (limit = 10) => {
    return await apiGet('/products/trending', {limit});
  },

  // Get recommended products
  getRecommended: async (limit = 10) => {
    return await apiGet('/products/recommended', {limit});
  },

  // Get compatible products
  getCompatible: async (productId, limit = 8) => {
    return await apiGet(`/products/${productId}/compatible`, {limit});
  },

  // Get frequently bought together
  getFrequentlyBoughtTogether: async productId => {
    return await apiGet(`/products/${productId}/frequently-bought-together`);
  },

  // Get product reviews
  getReviews: async (productId, params = {}) => {
    return await apiGet(`/products/${productId}/reviews`, {
      page: params.page || PAGINATION.DEFAULT_PAGE,
      limit: params.limit || PAGINATION.REVIEWS_LIMIT,
      sort: params.sort || 'newest',
    });
  },

  // Add review
  addReview: async (productId, reviewData) => {
    return await apiPost(`/products/${productId}/reviews`, reviewData);
  },

  // Upload review images
  uploadReviewImages: async (productId, formData, onProgress) => {
    return await apiUpload(
      `/products/${productId}/reviews/images`,
      formData,
      onProgress,
    );
  },

  // Seller: Create product
  createProduct: async productData => {
    return await apiPost('/products', productData);
  },

  // Seller: Update product
  updateProduct: async (id, productData) => {
    return await apiPut(`/products/${id}`, productData);
  },

  // Seller: Delete product
  deleteProduct: async id => {
    return await apiDelete(`/products/${id}`);
  },

  // Seller: Upload product images
  uploadProductImages: async (productId, formData, onProgress) => {
    return await apiUpload(
      `/products/${productId}/images`,
      formData,
      onProgress,
    );
  },

  // Seller: Get my products
  getMyProducts: async (params = {}) => {
    return await apiGet('/seller/products', params);
  },

  // Seller: Update inventory
  updateInventory: async (productId, stock) => {
    return await apiPut(`/seller/products/${productId}/inventory`, {stock});
  },

  // Admin: Approve product
  approveProduct: async (productId, approved) => {
    return await apiPut(`/admin/products/${productId}/approve`, {approved});
  },
};

export { productService };
export default productService;
