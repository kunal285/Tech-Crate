import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cartService from '../services/cartService';
import {STORAGE_KEYS, DELIVERY_FEES, TAX_RATE} from '../constants';

/**
 * Normalizes cart items from backend responses, frontend payloads, or local storage
 * to guarantee complete, consistent product properties (id, title, image, price, quantity).
 */
export const normalizeCartItem = (rawItem) => {
  if (!rawItem) return null;

  const productObj =
    rawItem.product ||
    rawItem.projectKit ||
    (rawItem._id && !rawItem.product ? rawItem : {});

  const resolvedProductId =
    rawItem.product?._id ||
    rawItem.projectKit?._id ||
    rawItem.productId ||
    productObj._id ||
    rawItem._id ||
    rawItem.id;

  const title =
    rawItem.title ||
    rawItem.name ||
    rawItem.product?.title ||
    rawItem.product?.name ||
    rawItem.projectKit?.title ||
    rawItem.projectKit?.name ||
    productObj.title ||
    productObj.name ||
    'Component';

  const price = Number(
    rawItem.price ??
    rawItem.product?.discountPrice ??
    rawItem.product?.price ??
    rawItem.projectKit?.price ??
    productObj.discountPrice ??
    productObj.price ??
    0
  );

  const originalPrice = Number(
    rawItem.originalPrice ??
    rawItem.product?.originalPrice ??
    rawItem.product?.price ??
    productObj.originalPrice ??
    price
  );

  const resolvedImage =
    rawItem.image ||
    rawItem.imageUrl ||
    (Array.isArray(rawItem.images) && rawItem.images[0]) ||
    rawItem.product?.images?.[0] ||
    rawItem.product?.image ||
    rawItem.product?.imageUrl ||
    rawItem.projectKit?.images?.[0] ||
    rawItem.projectKit?.image ||
    (Array.isArray(productObj.images) && productObj.images[0]) ||
    productObj.image ||
    productObj.imageUrl ||
    null;

  const resolvedImages =
    (Array.isArray(rawItem.images) && rawItem.images.length > 0 && rawItem.images) ||
    (Array.isArray(rawItem.product?.images) && rawItem.product.images.length > 0 && rawItem.product.images) ||
    (Array.isArray(rawItem.projectKit?.images) && rawItem.projectKit.images.length > 0 && rawItem.projectKit.images) ||
    (Array.isArray(productObj.images) && productObj.images.length > 0 && productObj.images) ||
    (resolvedImage ? [resolvedImage] : []);

  const quantity = Math.max(1, Number(rawItem.quantity) || 1);
  const stock = Number(rawItem.product?.stock ?? rawItem.projectKit?.stock ?? productObj.stock ?? 50);

  return {
    _id: String(rawItem._id || `item_${resolvedProductId}`),
    productId: String(resolvedProductId),
    product: productObj,
    itemType: rawItem.itemType || (rawItem.projectKit ? 'kit' : 'product'),
    title,
    name: title,
    price,
    originalPrice,
    image: resolvedImage,
    images: resolvedImages,
    quantity,
    stock,
    variant: rawItem.variant || null,
  };
};

const saveCartToStorage = async (items) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify(items));
  } catch (err) {
    console.warn('[CartStore] Failed to persist cart to storage:', err.message);
  }
};

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

  // Computed subtotal getter
  get subtotal() {
    return get().items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0,
    );
  },

  // Fetch cart from server and synchronize with local storage
  fetchCart: async () => {
    set({isLoading: true, error: null});
    try {
      const result = await cartService.getCart();
      if (result && result.success !== false) {
        const rawItems =
          result.data?.items ||
          result.items ||
          (Array.isArray(result.data) ? result.data : []);
        const normalized = rawItems.map(normalizeCartItem).filter(Boolean);
        set({
          items: normalized,
          savedItems: result.data?.savedItems || [],
          coupon: result.data?.coupon || null,
          couponDiscount: result.data?.couponDiscount || 0,
          isLoading: false,
          lastSynced: Date.now(),
        });
        await saveCartToStorage(normalized);
        return {success: true, data: result.data};
      } else {
        // Fallback to local storage if offline or guest mode
        await get().restoreLocal();
        set({error: result?.message, isLoading: false});
        return result || {success: false};
      }
    } catch (err) {
      await get().restoreLocal();
      set({error: err.message, isLoading: false});
      return {success: false, message: err.message};
    }
  },

  // Add item to cart (Optimistic update + persistent sync)
  addItem: async (product, quantity = 1, variant = null) => {
    if (!product) return {success: false, message: 'Invalid product'};

    const resolvedProduct =
      product.product || (product._id ? product : null) || {
        _id: product.productId || product.id,
        name: product.name || product.title,
        title: product.title || product.name,
        price: product.price,
        discountPrice: product.discountPrice || product.price,
        images: product.images || (product.image ? [product.image] : []),
        stock: product.stock ?? 10,
      };

    const targetProductId = String(resolvedProduct._id || resolvedProduct.id);
    const qty = Math.max(1, Number(quantity) || 1);

    const oldItems = get().items;
    const existingIndex = oldItems.findIndex(
      i =>
        String(i.productId) === targetProductId ||
        String(i.product?._id) === targetProductId ||
        String(i._id) === targetProductId,
    );

    let updatedItems;
    if (existingIndex >= 0) {
      updatedItems = [...oldItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + qty,
      };
    } else {
      const newItem = normalizeCartItem({
        _id: `temp_${targetProductId}_${Date.now()}`,
        productId: targetProductId,
        product: resolvedProduct,
        title: resolvedProduct.title || resolvedProduct.name,
        name: resolvedProduct.name || resolvedProduct.title,
        price: resolvedProduct.discountPrice || resolvedProduct.price,
        images:
          resolvedProduct.images ||
          (resolvedProduct.image ? [resolvedProduct.image] : []),
        image: resolvedProduct.images?.[0] || resolvedProduct.image,
        quantity: qty,
        variant,
      });
      updatedItems = [...oldItems, newItem];
    }

    set({items: updatedItems, error: null});
    await saveCartToStorage(updatedItems);

    try {
      const result = await cartService.addItem(targetProductId, qty, variant);
      if (result && result.success !== false) {
        const serverItems = result.data?.items || result.items;
        if (Array.isArray(serverItems)) {
          const normalized = serverItems.map(normalizeCartItem).filter(Boolean);
          set({items: normalized, lastSynced: Date.now()});
          await saveCartToStorage(normalized);
        }
        return {success: true, data: result.data};
      } else {
        return result || {success: true};
      }
    } catch (err) {
      console.warn('[CartStore] Add item backend sync error (kept in local cart):', err.message);
      return {success: true, isLocal: true};
    }
  },

  // Alias for addItem to support common e-commerce naming
  addToCart: async (productOrPayload, quantity = 1, variant = null) => {
    if (!productOrPayload) return {success: false, message: 'Invalid product'};
    const qty = productOrPayload.quantity || quantity || 1;
    return get().addItem(productOrPayload, qty, variant);
  },

  // Update quantity (Optimistic update + persistent sync)
  updateQuantity: async (cartItemId, quantity) => {
    const targetId = String(cartItemId);
    const qty = Number(quantity);

    if (qty < 1) {
      return get().removeItem(targetId);
    }

    const oldItems = get().items;
    const updatedItems = oldItems.map(item => {
      if (
        String(item._id) === targetId ||
        String(item.productId) === targetId ||
        String(item.product?._id) === targetId
      ) {
        return {...item, quantity: qty};
      }
      return item;
    });

    set({items: updatedItems, error: null});
    await saveCartToStorage(updatedItems);

    try {
      const result = await cartService.updateQuantity(targetId, qty);
      if (result && result.success !== false) {
        const serverItems = result.data?.items || result.items;
        if (Array.isArray(serverItems)) {
          const normalized = serverItems.map(normalizeCartItem).filter(Boolean);
          set({items: normalized, lastSynced: Date.now()});
          await saveCartToStorage(normalized);
        }
      }
      return result || {success: true};
    } catch (err) {
      console.warn('[CartStore] Update quantity API error:', err.message);
      return {success: true};
    }
  },

  // Remove item (Immediate local removal + persistent sync + API delete)
  removeItem: async cartItemId => {
    const targetId = String(cartItemId);
    const oldItems = get().items;

    // Immediately remove matching item by _id, productId, or product._id
    const filteredItems = oldItems.filter(
      i =>
        String(i._id) !== targetId &&
        String(i.productId) !== targetId &&
        String(i.product?._id) !== targetId,
    );

    set({items: filteredItems, error: null});
    // Immediately persist to storage so reloads and navigation never resurrect the item
    await saveCartToStorage(filteredItems);

    try {
      const result = await cartService.removeItem(targetId);
      if (result && result.success !== false) {
        const serverItems = result.data?.items || result.items;
        if (Array.isArray(serverItems)) {
          const normalized = serverItems.map(normalizeCartItem).filter(Boolean);
          set({items: normalized, lastSynced: Date.now()});
          await saveCartToStorage(normalized);
        }
        return {success: true};
      }
      return {success: true};
    } catch (err) {
      console.warn('[CartStore] Remove item API warning:', err.message);
      return {success: true};
    }
  },

  // Apply coupon
  applyCoupon: async couponCode => {
    set({isLoading: true, error: null});
    const result = await cartService.applyCoupon(couponCode);
    if (result && result.success) {
      set({
        coupon: result.data.coupon,
        couponDiscount: result.data.discount,
        isLoading: false,
      });
    } else {
      set({error: result?.message, isLoading: false});
    }
    return result;
  },

  // Remove coupon
  removeCoupon: async () => {
    try {
      await cartService.removeCoupon();
    } catch {}
    set({coupon: null, couponDiscount: 0});
  },

  // Set delivery type
  setDeliveryType: deliveryType => set({deliveryType}),

  // Calculate totals
  getTotals: () => {
    const {items, couponDiscount, deliveryType} = get();
    const subtotal = items.reduce(
      (sum, item) =>
        sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0,
    );
    const tax = Math.round(subtotal * TAX_RATE);
    const deliveryFee =
      subtotal === 0 || subtotal >= DELIVERY_FEES.FREE_ABOVE
        ? 0
        : deliveryType === 'express'
        ? DELIVERY_FEES.EXPRESS
        : DELIVERY_FEES.STANDARD;
    const total = Math.max(0, subtotal + tax + deliveryFee - couponDiscount);
    return {subtotal, tax, deliveryFee, couponDiscount, total};
  },

  // Get item count for header badges
  getItemCount: () =>
    get().items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),

  // Clear cart locally
  clearLocal: async () => {
    set({items: [], coupon: null, couponDiscount: 0});
    await AsyncStorage.removeItem(STORAGE_KEYS.CART_DATA);
  },

  // Clear cart (locally and on backend)
  clearCart: async () => {
    set({items: [], coupon: null, couponDiscount: 0});
    await AsyncStorage.removeItem(STORAGE_KEYS.CART_DATA);
    try {
      await cartService.clearCart();
    } catch {}
  },

  // Clear error
  clearError: () => set({error: null}),

  // Persist cart locally
  persistLocal: async () => {
    await saveCartToStorage(get().items);
  },

  // Restore local cart from AsyncStorage
  restoreLocal: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CART_DATA);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map(normalizeCartItem).filter(Boolean);
          set({items: normalized});
          return normalized;
        }
      }
    } catch (err) {
      console.warn('[CartStore] Failed to restore local cart:', err.message);
    }
    return [];
  },
}));

export { useCartStore };
export default useCartStore;
