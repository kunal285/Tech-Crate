'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DELIVERY_FEES, FREE_DELIVERY_THRESHOLD } from '@/lib/constants';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart and coupon from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('techcrate_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem('techcrate_coupon');
      if (savedCoupon) {
        setCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error('[Cart Load Error]', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('techcrate_cart', JSON.stringify(cartItems));
      } catch (e) {
        console.error('[Cart Save Error]', e);
      }
    }
  }, [cartItems, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      try {
        if (coupon) {
          localStorage.setItem('techcrate_coupon', JSON.stringify(coupon));
        } else {
          localStorage.removeItem('techcrate_coupon');
        }
      } catch (e) {
        console.error('[Coupon Save Error]', e);
      }
    }
  }, [coupon, isLoaded]);

  const addToCart = (product, quantity = 1) => {
    if (!product || !product._id) return false;

    setCartItems((prev) => {
      const pId = product._id;
      const existingIndex = prev.findIndex((item) => (item._id === pId || item.id === pId));

      const price = Number(product.discountedPrice || product.price || 0);
      const originalPrice = Number(product.originalPrice || price);
      const title = product.title || 'Component';
      const image = product.image || (product.images && product.images[0]) || '';
      const stock = product.stock !== undefined ? product.stock : 99;
      const itemType = product.itemType || 'product';
      const projectKit = product.projectKit;

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, stock),
        };
        return updated;
      }

      return [
        ...prev,
        {
          _id: pId,
          id: pId,
          title,
          price,
          originalPrice,
          image,
          images: product.images || [image],
          quantity: Math.min(quantity, stock),
          stock,
          itemType,
          projectKit,
          product,
        },
      ];
    });

    return true;
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === productId || item.id === productId
          ? { ...item, quantity: Math.min(newQuantity, item.stock || 99) }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) =>
      prev.filter((item) => item._id !== productId && item.id !== productId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const applyCoupon = (code) => {
    const clean = String(code).toUpperCase().trim();
    if (!clean) return { success: false, message: 'Please enter a coupon code.' };

    if (clean === 'MAKER10' || clean === 'TECHCRATE' || clean === 'STUDENT10') {
      const c = {
        code: clean,
        discountType: 'percentage',
        discountValue: 10,
      };
      setCoupon(c);
      return { success: true, message: '10% discount applied successfully!' };
    }

    if (clean === 'FLAT50') {
      const c = {
        code: clean,
        discountType: 'fixed',
        discountValue: 50,
      };
      setCoupon(c);
      return { success: true, message: '₹50 flat discount applied!' };
    }

    return { success: false, message: 'Invalid or expired coupon code.' };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculations
  const totalCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  const subtotal = cartItems.reduce((sum, item) => {
    const p = Number(item.price || 0);
    const q = Number(item.quantity || 1);
    return sum + p * q;
  }, 0);

  const originalTotal = cartItems.reduce((sum, item) => {
    const op = Number(item.originalPrice || item.price || 0);
    const q = Number(item.quantity || 1);
    return sum + op * q;
  }, 0);

  let discountAmount = 0;
  if (coupon && subtotal > 0) {
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
    } else if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(subtotal, coupon.discountValue);
    }
  }

  const savings = Math.max(0, originalTotal - subtotal + discountAmount);

  const deliveryFee =
    subtotal === 0
      ? 0
      : subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : DELIVERY_FEES.STANDARD;

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(discountedSubtotal * 0.18); // 18% GST (already factored in prices)
  const totalAmount = discountedSubtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        items: cartItems, // Alias for backward compatibility
        totalCount,
        subtotal,
        originalTotal,
        discountAmount,
        savings,
        deliveryFee,
        taxAmount,
        totalAmount,
        coupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
