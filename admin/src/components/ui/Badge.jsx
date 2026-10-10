'use client';

import React from 'react';

export function Badge({
  children,
  variant = 'neutral', // 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size = 'md', // 'sm' | 'md'
  className = '',
}) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantStyles = {
    primary:
      'bg-blue-50 text-brand-primary border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900',
    success:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900',
    warning:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
    danger:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900',
    info:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900',
    neutral:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border tracking-wide ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, type = 'order', size = 'md', className = '' }) {
  if (!status) return null;

  const getStatusConfig = () => {
    const s = String(status).toLowerCase().replace(/[\s_-]+/g, '');

    // 1. Order Statuses
    if (s === 'placed' || s === 'pending') {
      return {
        bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/60',
        text: 'text-sky-700 dark:text-sky-300',
        dot: 'bg-sky-500',
        label: 'Placed',
      };
    }
    if (s === 'confirmed') {
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60',
        text: 'text-indigo-700 dark:text-indigo-300',
        dot: 'bg-indigo-500',
        label: 'Confirmed',
      };
    }
    if (s === 'processing' || s === 'packed') {
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60',
        text: 'text-purple-700 dark:text-purple-300',
        dot: 'bg-purple-500',
        label: 'Processing',
      };
    }
    if (s === 'shipped') {
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60',
        text: 'text-blue-700 dark:text-blue-300',
        dot: 'bg-blue-500',
        label: 'Shipped',
      };
    }
    if (s === 'outfordelivery') {
      return {
        bg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/60',
        text: 'text-cyan-700 dark:text-cyan-300',
        dot: 'bg-cyan-500',
        label: 'Out for Delivery',
      };
    }
    if (s === 'delivered' || s === 'approved' || s === 'active' || s === 'instock' || s === 'paid') {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60',
        text: 'text-emerald-700 dark:text-emerald-300',
        dot: 'bg-emerald-500',
        label: status === 'paid' ? 'Paid' : status,
      };
    }
    if (s === 'cancelled' || s === 'rejected' || s === 'outofstock' || s === 'failed') {
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60',
        text: 'text-rose-700 dark:text-rose-300',
        dot: 'bg-rose-500',
        label: status,
      };
    }
    if (s === 'lowstock' || s === 'returned' || s === 'refunded' || s === 'replacementrequested') {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
        text: 'text-amber-700 dark:text-amber-300',
        dot: 'bg-amber-500',
        label: status,
      };
    }

    return {
      bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-400',
      label: status,
    };
  };

  const config = getStatusConfig();
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border tracking-wide select-none ${sizeStyles} ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}

export default { Badge, StatusBadge };
