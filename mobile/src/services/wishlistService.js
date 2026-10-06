import {apiGet, apiPost, apiDelete} from './api';

const wishlistService = {
  // Get wishlist
  getWishlist: async () => {
    return await apiGet('/wishlist');
  },

  // Add to wishlist
  addToWishlist: async productId => {
    return await apiPost('/wishlist/add', {productId});
  },

  // Remove from wishlist
  removeFromWishlist: async productId => {
    return await apiDelete(`/wishlist/${productId}`);
  },

  // Clear wishlist
  clearWishlist: async () => {
    return await apiDelete('/wishlist/clear');
  },

  // Move wishlist item to cart
  moveToCart: async productId => {
    return await apiPost(`/wishlist/${productId}/move-to-cart`);
  },

  // Check if product is in wishlist
  isInWishlist: (wishlistItems, productId) => {
    return wishlistItems.some(
      item => item.product?._id === productId || item._id === productId,
    );
  },
};

export default wishlistService;
