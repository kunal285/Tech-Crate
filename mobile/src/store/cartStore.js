import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cartService from '../services/cartService';
import {STORAGE_KEYS, DELIVERY_FEES, TAX_RATE} from '../constants';

const useCartStore = create((set, get) => ({
  // State
  items: [],
  savedItems: [],
  coupon: null,
  couponDiscount: 0,
  deliveryType: 'standard',
  isLoading: false,
  error: null,
  lastSynced: null,

  // Computed totals
  get subtotal() {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  },

  // Fetch cart from server
  fetchCart: async () => {
    set({isLoading: true, error: null});
    const result = await cartService.getCart();
    if (result.success) {
      set({
        items: result.data.items || [],
        savedItems: result.data.savedItems || [],
        coupon: result.data.coupon || null,
        couponDiscount: result.data.couponDiscount || 0,
        isLoading: false,
        lastSynced: Date.now(),
      });
    } else {
      set({error: result.message, isLoading: false});
    }
    return result;
  },

  // Add item to cart
  addItem: async (product, quantity = 1, variant = null) => {
    // Optimistic update
    const {items} = get();
    const existingIndex = items.findIndex(
      i => i.product?._id === product._id,
    );

    if (existingIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + quantity,
      };
      set({items: updatedItems});
    } else {
      set({
        items: [
          ...items,
          {
            _id: `temp_${product._id}`,
            product,
            productId: product._id,
            name: product.name,
            price: product.discountPrice || product.price,
            image: product.images?.[0],
            quantity,
            variant,
          },
        ],
      });
    }

    const result = await cartService.addItem(product._id, quantity, variant);
    if (result.success) {
      set({
        items: result.data.cart?.items || get().items,
        lastSynced: Date.now(),
      });
    } else {
      // Rollback on failure
      set({items, error: result.message});
    }
    return result;
  },

  // Alias for addItem to support common e-commerce naming
  addToCart: async (productOrPayload, quantity = 1, variant = null) => {
    if (!productOrPayload) return { success: false, message: 'Invalid product' };
    const product = productOrPayload.product || (productOrPayload._id ? productOrPayload : null) || {
      _id: productOrPayload.productId || productOrPayload.id,
      name: productOrPayload.title || productOrPayload.name,
      title: productOrPayload.title || productOrPayload.name,
      price: productOrPayload.price,
      discountPrice: productOrPayload.discountPrice || productOrPayload.price,
      images: productOrPayload.images || (productOrPayload.image ? [productOrPayload.image] : []),
      stock: productOrPayload.stock ?? 10,
    };
    const qty = productOrPayload.quantity || quantity || 1;
    return get().addItem(product, qty, variant);
  },
  updateQuantity: async (cartItemId, quantity) => {
    if (quantity < 1) return get().removeItem(cartItemId);

    const oldItems = get().items;
    const updatedItems = oldItems.map(item =>
      item._id === cartItemId ? {...item, quantity} : item,
    );
    set({items: updatedItems});

    const result = await cartService.updateQuantity(cartItemId, quantity);
    if (!result.success) {
      set({items: oldItems, error: result.message});
    }
    return result;
  },

  // Remove item
  removeItem: async cartItemId => {
    const oldItems = get().items;
    set({items: oldItems.filter(i => i._id !== cartItemId)});

    const result = await cartService.removeItem(cartItemId);
    if (!result.success) {
      set({items: oldItems, error: result.message});
    }
    return result;
  },

  // Apply coupon
  applyCoupon: async couponCode => {
    set({isLoading: true, error: null});
    const result = await cartService.applyCoupon(couponCode);
    if (result.success) {
      set({
        coupon: result.data.coupon,
        couponDiscount: result.data.discount,
        isLoading: false,
      });
    } else {
      set({error: result.message, isLoading: false});
    }
    return result;
  },

  // Remove coupon
  removeCoupon: async () => {
    await cartService.removeCoupon();
    set({coupon: null, couponDiscount: 0});
  },

  // Set delivery type
  setDeliveryType: deliveryType => set({deliveryType}),

  // Calculate totals
  getTotals: () => {
    const {items, couponDiscount, deliveryType} = get();
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const tax = Math.round(subtotal * TAX_RATE);
    const deliveryFee =
      subtotal >= DELIVERY_FEES.FREE_ABOVE
        ? 0
        : deliveryType === 'express'
        ? DELIVERY_FEES.EXPRESS
        : DELIVERY_FEES.STANDARD;
    const total = subtotal + tax + deliveryFee - couponDiscount;
    return {subtotal, tax, deliveryFee, couponDiscount, total};
  },

  // Get item count
  getItemCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),

  // Clear cart locally
  clearLocal: () =>
    set({items: [], coupon: null, couponDiscount: 0}),

  // Clear cart (locally and on backend)
  clearCart: async () => {
    set({items: [], coupon: null, couponDiscount: 0});
    try {
      await cartService.clearCart();
      await AsyncStorage.removeItem(STORAGE_KEYS.CART_DATA);
    } catch {}
  },

  // Clear error
  clearError: () => set({error: null}),

  // Persist cart locally
  persistLocal: async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CART_DATA,
        JSON.stringify(get().items),
      );
    } catch {}
  },

  // Restore local cart
  restoreLocal: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CART_DATA);
      if (data) set({items: JSON.parse(data)});
    } catch {}
  },
}));

export { useCartStore };
export default useCartStore;
