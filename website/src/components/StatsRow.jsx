'use client';

import React from 'react';
import { Package, Cpu, Rocket, Star } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export default function StatsRow() {
  const stats = [
    { icon: Package, value: '350+', label: 'Products' },
    { icon: Cpu, value: '10+', label: 'Projects' },
    { icon: Rocket, value: '1K+', label: 'Students' },
    { icon: Star, value: '4.3', label: 'Rating' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm py-3.5 px-4 my-3 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className={`flex flex-col items-center justify-center p-2 ${
              i === 0 || i === 1 ? 'pb-3 sm:pb-2' : 'pt-3 sm:pt-2'
            }`}
          >
            <div className="mb-1 p-2 rounded-xl bg-slate-50 text-brand-navy flex items-center justify-center">
              <Icon className="w-4 h-4 text-brand-navy" style={{ color: BRAND.navy }} />
            </div>
            <span
              className="text-base font-extrabold tracking-tight text-slate-900 leading-none mb-0.5"
              style={{ color: BRAND.navy }}
            >
              {stat.value}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              {stat.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
