'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  X,
  Truck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/constants';
import { BRAND } from '@/theme/tokens';

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    deliveryFee,
    taxAmount,
    totalAmount,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput.trim().toUpperCase());
    if (res.success) {
      setCouponSuccess(true);
      setCouponInput('');
      setTimeout(() => setCouponSuccess(false), 3000);
    } else {
      setCouponError(res.message || 'Invalid or expired coupon code.');
    }
  };

  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - (subtotal || 0));
  const freeDeliveryProgress = Math.min(100, ((subtotal || 0) / FREE_DELIVERY_THRESHOLD) * 100);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm my-8">
        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Cart is Empty</h1>
        <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed">
          Explore thousands of microcontrollers, sensors, robotics parts & engineering project kits!
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          style={{ backgroundColor: BRAND.navy }}
        >
          <span>Browse Hardware Store</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: BRAND.navy }}
          >
            Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your selected components and proceed to secure checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold self-start sm:self-auto hover:underline"
        >
          Clear All Items
        </button>
      </div>

      {/* Free Delivery Incentive Progress Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-800 font-bold">
            <Truck className="w-4 h-4 text-sky-600" />
            <span>
              {amountNeededForFreeDelivery > 0
                ? `Add ₹${amountNeededForFreeDelivery} more for FREE Delivery!`
                : '🎉 Congratulations! You have unlocked FREE Express Delivery!'}
            </span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            ₹{FREE_DELIVERY_THRESHOLD} Target
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      {/* Main Cart Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {cartItems.map((item, idx) => {
            const itemId = item._id || item.productId || item.id || `item_${idx}`;
            const itemImage =
              item.image ||
              (item.images && item.images[0]) ||
              'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80';
            const price = Number(item.price || 0);
            const qty = Number(item.quantity || 1);

            return (
              <div
                key={itemId}
                className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3.5 transition-all hover:border-slate-300"
              >
                {/* Thumbnail */}
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                  <Image
                    src={itemImage}
                    alt={item.title || 'Product'}
                    fill
                    sizes="(max-width: 640px) 72px, 80px"
                    className="object-contain p-2"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={
                        item.itemType === 'kit'
                          ? `/projects/${item.projectKit || item._id}`
                          : `/products/${item._id}`
                      }
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-brand-primary transition-colors line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.category && (
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      {item.category}
                    </span>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span
                        className="text-sm sm:text-base font-extrabold"
                        style={{ color: BRAND.navy }}
                      >
                        ₹{(price * qty).toLocaleString('en-IN')}
                      </span>
                      {qty > 1 && (
                        <span className="text-[11px] text-slate-400 font-medium ml-1">
                          (₹{price.toLocaleString('en-IN')} ea)
                        </span>
                      )}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, qty - 1)}
                        className={`p-1.5 transition-colors ${
                          qty <= 1
                            ? 'text-rose-500 hover:text-rose-700'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title={qty <= 1 ? 'Remove from cart' : 'Decrease quantity'}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-slate-900 min-w-[24px] text-center">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, qty + 1)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Coupon & Bill Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Promo / Coupon Section */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Tag className="w-4 h-4" style={{ color: BRAND.primary }} />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Discount Coupon
              </h3>
            </div>

            {coupon ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{typeof coupon === 'string' ? coupon : coupon.code}</span>
                  {discountAmount > 0 && (
                    <span className="text-[11px] font-normal text-emerald-700">
                      (-₹{Number(discountAmount).toLocaleString('en-IN')})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="p-1 text-rose-600 hover:text-rose-800 transition-colors"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon (e.g. TECH10)"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold uppercase text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#032762] hover:bg-[#034697] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                    style={{ backgroundColor: BRAND.navy }}
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                )}
                {couponSuccess && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    Coupon applied successfully!
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Bill Breakdown Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100">
              Bill Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ₹{Number(subtotal).toLocaleString('en-IN')}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                  <span>Coupon Savings</span>
                  <span>-₹{Number(discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>Estimated GST (18%)</span>
                <span className="font-semibold text-slate-900">
                  ₹{Number(taxAmount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Delivery Charges</span>
                <span className="font-semibold">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Total Payable</span>
              <span
                className="text-xl font-black"
                style={{ color: BRAND.navy }}
              >
                ₹{Number(totalAmount).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-1">
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#032762] hover:bg-[#034697] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
                style={{ backgroundColor: BRAND.navy }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-slate-500 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safe & Secure Payments with 256-bit encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
