import {apiGet, apiPost, apiPut, apiDelete} from './api';

const cartService = {
  // Get cart
  getCart: async () => {
    return await apiGet('/cart');
  },

  // Add item to cart
  addItem: async (productId, quantity = 1, variant = null) => {
    return await apiPost('/cart/add', {productId, quantity, variant});
  },

  // Update item quantity
  updateQuantity: async (cartItemId, quantity) => {
    return await apiPut(`/cart/items/${cartItemId}`, {quantity});
  },

  // Remove item from cart
  removeItem: async cartItemId => {
    return await apiDelete(`/cart/items/${cartItemId}`);
  },

  // Clear cart
  clearCart: async () => {
    return await apiDelete('/cart');
  },

  // Save item for later
  saveForLater: async cartItemId => {
    return await apiPost(`/cart/item/${cartItemId}/save-later`);
  },

  // Move saved item to cart
  moveToCart: async cartItemId => {
    return await apiPost(`/cart/item/${cartItemId}/move-to-cart`);
  },

  // Apply coupon
  applyCoupon: async couponCode => {
    return await apiPost('/cart/coupon', {couponCode});
  },

  // Remove coupon
  removeCoupon: async () => {
    return await apiDelete('/cart/coupon');
  },

  // Calculate cart totals (local utility)
  calculateTotals: (items, couponDiscount = 0, deliveryFee = 0) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax + deliveryFee - couponDiscount;
    return {subtotal, tax, deliveryFee, couponDiscount, total};
  },
};

export { cartService };
export default cartService;
