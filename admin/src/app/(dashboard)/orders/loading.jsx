import React from 'react';

export default function OrdersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2 shadow-xs">
            <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-6 w-16 bg-slate-300 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      <div className="h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs" />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="h-12 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800" />
        <div className="divide-y divide-slate-100 dark:divide-slate-800 p-4 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800/40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
