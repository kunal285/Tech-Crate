import {create} from 'zustand';
import wishlistService from '../services/wishlistService';

const useWishlistStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchWishlist: async () => {
    set({isLoading: true, error: null});
    const result = await wishlistService.getWishlist();
    if (result.success) {
      set({items: result.data.items || [], isLoading: false});
    } else {
      set({error: result.message, isLoading: false});
    }
  },

  addItem: async product => {
    const {items} = get();
    if (get().isInWishlist(product._id)) return;

    // Optimistic update
    set({items: [...items, {product, productId: product._id}]});
    const result = await wishlistService.addToWishlist(product._id);
    if (result.success) {
      set({items: result.data.items || get().items});
    } else {
      set({items, error: result.message});
    }
    return result;
  },

  removeItem: async productId => {
    const oldItems = get().items;
    set({
      items: oldItems.filter(
        i => i.product?._id !== productId && i.productId !== productId,
      ),
    });
    const result = await wishlistService.removeFromWishlist(productId);
    if (!result.success) {
      set({items: oldItems, error: result.message});
    }
    return result;
  },

  toggleItem: async product => {
    if (get().isInWishlist(product._id)) {
      return get().removeItem(product._id);
    }
    return get().addItem(product);
  },

  isInWishlist: productId => {
    return get().items.some(
      i => i.product?._id === productId || i.productId === productId,
    );
  },

  getCount: () => get().items.length,
  clearError: () => set({error: null}),
}));

export { useWishlistStore };
export default useWishlistStore;
