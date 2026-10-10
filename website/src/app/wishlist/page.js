'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { BRAND } from '@/theme/tokens';

export default function WishlistPage() {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [addedIds, setAddedIds] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('techcrate_wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch {
      setWishlist([]);
    }
  }, []);

  const handleRemove = (id) => {
    const updated = wishlist.filter((item) => (item._id || item.id) !== id);
    setWishlist(updated);
    try {
      localStorage.setItem('techcrate_wishlist', JSON.stringify(updated));
    } catch {}
  };

  const handleMoveToCart = async (item) => {
    const id = item._id || item.id;
    await addToCart(item, 1);
    setAddedIds((prev) => [...prev, id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((i) => i !== id));
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="pb-3 border-b border-slate-200">
        <h1
          className="text-2xl sm:text-3xl font-black tracking-tight"
          style={{ color: BRAND.navy }}
        >
          Saved Wishlist
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Components, microcontrollers, and DIY kits you&apos;ve bookmarked for your next build.
        </p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {wishlist.map((item) => {
            const id = item._id || item.id;
            const image =
              item.image ||
              (item.images && item.images[0]) ||
              'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80';
            const isAdded = addedIds.includes(id);

            return (
              <div
                key={id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
              >
                <div className="relative aspect-square w-full rounded-xl bg-slate-50 border border-slate-100 overflow-hidden">
                  <Image
                    src={image}
                    alt={item.title || 'Product'}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain p-2"
                  />
                  <button
                    onClick={() => handleRemove(id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-slate-400 hover:text-rose-600 transition-colors shadow-2xs"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <Link
                    href={`/products/${id}`}
                    className="text-xs sm:text-sm font-bold text-slate-900 hover:text-brand-primary transition-colors line-clamp-2"
                  >
                    {item.title}
                  </Link>
                  <div
                    className="text-sm font-black"
                    style={{ color: BRAND.navy }}
                  >
                    ₹{Number(item.price || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <button
                  onClick={() => handleMoveToCart(item)}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                    isAdded ? 'bg-emerald-600 text-white' : 'bg-[#032762] hover:bg-[#034697] text-white'
                  }`}
                  style={{
                    backgroundColor: isAdded ? undefined : BRAND.navy,
                  }}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm max-w-md mx-auto">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Bookmark sensors and dev boards while browsing to review them later.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#032762] hover:bg-[#034697] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            style={{ backgroundColor: BRAND.navy }}
          >
            <span>Explore Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
