'use client';

import React from 'react';
import Link from 'next/link';
import { Package, MapPin, Heart, Headphones, ChevronRight } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export default function QuickAccessGrid({
  ordersCount = 0,
  wishlistCount = 0,
  addressSummary = null,
  onAddressClick,
  onSupportClick,
}) {
  const cards = [
    {
      title: 'My Orders',
      subtitle: ordersCount > 0 ? `${ordersCount} orders placed` : 'Track dispatches & shipments',
      badge: ordersCount > 0 ? `${ordersCount}` : null,
      icon: Package,
      iconBg: '#032762',
      href: '/orders',
    },
    {
      title: 'Saved Addresses',
      subtitle: addressSummary || 'Manage delivery & campus addresses',
      icon: MapPin,
      iconBg: '#2563EB',
      onClick: onAddressClick,
    },
    {
      title: 'Saved Wishlist',
      subtitle: wishlistCount > 0 ? `${wishlistCount} bookmarked items` : 'Hardware saved for later',
      badge: wishlistCount > 0 ? `${wishlistCount}` : null,
      icon: Heart,
      iconBg: '#E11D48',
      href: '/wishlist',
    },
    {
      title: '24/7 Helpline',
      subtitle: '+91 83292 76568 • Support & FAQs',
      icon: Headphones,
      iconBg: '#0D9488',
      onClick: onSupportClick,
      href: onSupportClick ? undefined : '/contact',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const content = (
          <div className="flex flex-col justify-between h-full p-4 sm:p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                style={{ backgroundColor: card.iconBg }}
              >
                <Icon className="w-5 h-5" />
              </div>

              {card.badge && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white"
                  style={{ backgroundColor: BRAND.orange }}
                >
                  {card.badge}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {card.title}
                </h3>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal">
                {card.subtitle}
              </p>
            </div>
          </div>
        );

        if (card.href) {
          return (
            <Link key={idx} href={card.href} className="block h-full">
              {content}
            </Link>
          );
        }

        return (
          <button
            key={idx}
            type="button"
            onClick={card.onClick}
            className="block h-full text-left w-full"
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
