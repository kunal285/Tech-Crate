'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Check, ShoppingCart, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product, horizontal = false }) {
  const { addToCart } = useCart();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const title = product.title || product.name || 'Component';
  const brand =
    product.brand ||
    (typeof product.category === 'string' ? product.category : 'Tech Crate');
  const price = product.price ?? 0;
  const originalPrice = product.originalPrice;
  const discountPercent =
    product.discountPercentage ||
    (originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null);

  const image =
    (product.images && product.images[0]) ||
    product.image ||
    product.imageUrl ||
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80';

  const inStock = product.stock === undefined || product.stock > 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || isAdding) return;

    setIsAdding(true);
    const ok = await addToCart(product, 1);
    setIsAdding(false);
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInWishlist(!isInWishlist);

    try {
      const stored = localStorage.getItem('techcrate_wishlist');
      let list = stored ? JSON.parse(stored) : [];
      if (!isInWishlist) {
        list = [...list.filter((p) => p._id !== product._id), product];
      } else {
        list = list.filter((p) => p._id !== product._id);
      }
      localStorage.setItem('techcrate_wishlist', JSON.stringify(list));
    } catch {}
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      {/* Product Image Container */}
      <div className="relative w-full aspect-square bg-[#F8FAFC] overflow-hidden flex items-center justify-center p-3">
        <Link href={`/products/${product._id}`} className="relative w-full h-full block">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Badges (Top-Left) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-[#F97316] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {!inStock && (
            <span className="bg-[#DC2626] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Circular Wishlist Button (Top-Right) */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label="Save to Wishlist"
          className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-xs border border-slate-100 flex items-center justify-center z-10 hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              isInWishlist ? 'text-[#EF4444] fill-[#EF4444]' : 'text-slate-400'
            }`}
          />
        </button>
      </div>

      {/* Product Content (Flow Layout matching Mobile ProductCard) */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 gap-2">
        <div>
          {/* Brand Name */}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">
            {brand}
          </span>

          {/* Product Title (2-line clamp, 13px) */}
          <Link
            href={`/products/${product._id}`}
            className="text-[13px] font-semibold text-slate-900 leading-[18px] h-9 line-clamp-2 hover:text-[#2563EB] transition-colors block"
          >
            {title}
          </Link>

          {/* Rating Row */}
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
            <span className="text-[11px] font-semibold text-slate-600">
              {product.ratings?.average ? Number(product.ratings.average).toFixed(1) : '4.8'}
            </span>
            <span className="text-[11px] text-slate-400">
              ({product.ratings?.count || 14})
            </span>
          </div>

          {/* Price & Original MRP */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[15px] font-extrabold text-[#2563EB] font-mono">
              ₹{Number(price).toLocaleString('en-IN')}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-[11px] text-slate-400 line-through font-mono">
                ₹{Number(originalPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button (Matching Mobile ProductCard.js) */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock || isAdding}
          className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            !inStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : added
              ? 'bg-[#16A34A] text-white shadow-xs'
              : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs hover:shadow-sm'
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added!</span>
            </>
          ) : !inStock ? (
            <span>Out of Stock</span>
          ) : (
            <span>+ Cart</span>
          )}
        </button>
      </div>
    </div>
  );
}
