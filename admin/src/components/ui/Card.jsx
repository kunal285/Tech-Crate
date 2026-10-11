'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs transition-colors duration-150 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({
  title,
  value,
  change,
  trend = 'up', // 'up' | 'down' | 'neutral'
  icon: Icon,
  description,
  accentColor = 'blue', // 'blue' | 'orange' | 'purple' | 'emerald' | 'cyan'
  className = '',
}) {
  const accentStyles = {
    blue: 'bg-blue-50 text-brand-primary border-blue-100 dark:bg-blue-950/50 dark:border-blue-900/40',
    orange: 'bg-orange-50 text-brand-orange border-orange-100 dark:bg-orange-950/50 dark:border-orange-900/40',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/50 dark:border-purple-900/40',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/50 dark:border-emerald-900/40',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-950/50 dark:border-cyan-900/40',
  };

  const trendStyles = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-rose-600 dark:text-rose-400',
    neutral: 'text-slate-500 dark:text-slate-400',
  };

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <Card className={`p-5 relative overflow-hidden admin-card-hover ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
              accentStyles[accentColor] || accentStyles.blue
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <span className="text-2xl sm:text-3xl font-extrabold text-[#032762] dark:text-blue-400 tracking-tight tabular-nums">
          {value}
        </span>
      </div>

      {(change || description) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
          {change && (
            <span className={`inline-flex items-center gap-0.5 font-semibold ${trendStyles[trend]}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              <span>{change}</span>
            </span>
          )}
          {description && (
            <span className="text-slate-400 dark:text-slate-500 truncate">{description}</span>
          )}
        </div>
      )}
    </Card>
  );
}

export default { Card, StatCard };
