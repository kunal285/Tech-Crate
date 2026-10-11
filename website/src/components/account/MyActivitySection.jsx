'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, MessageSquare, Star, ArrowRight, Package } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export default function MyActivitySection() {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('techcrate_recently_viewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentProducts(parsed.slice(0, 4));
        }
      }
    } catch {
      setRecentProducts([]);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Recently Viewed Hardware */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Recently Viewed Hardware Components</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sensors, development boards, and modules you recently explored.
            </p>
          </div>

          <Link
            href="/products"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 sm:p-6">
          {recentProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {recentProducts.map((p) => {
                const img =
                  p.images?.[0] ||
                  p.image ||
                  '/placeholder-component.png';
                return (
                  <Link
                    key={p._id || p.id}
                    href={`/products/${p._id || p.id}`}
                    className="group block p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all bg-white"
                  >
                    <div className="aspect-square w-full rounded-lg bg-slate-50 overflow-hidden mb-2.5 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={p.name || p.title || 'Product'}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {p.name || p.title}
                    </h4>
                    {p.price !== undefined && (
                      <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 px-4 space-y-2">
              <Package className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No recently viewed components</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Electronic components, microcontrollers, and kits you view while browsing will appear here.
              </p>
              <div className="pt-1">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Questions & Answers & Community Discussions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Maker Q&A Activity</h3>
              <p className="text-[11px] text-slate-500">Component datasheets & pinout queries</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <p className="text-xs text-slate-600">
              No questions submitted yet.
            </p>
            <Link
              href="/ai-assistant"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
            >
              <span>Ask AI Hardware Assistant</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ratings & Component Reviews</h3>
              <p className="text-[11px] text-slate-500">Verified builder feedback</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
            <p className="text-xs text-slate-600">
              No reviews posted yet.
            </p>
            <p className="text-[11px] text-slate-400">
              Review options appear on delivered orders to help fellow builders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
