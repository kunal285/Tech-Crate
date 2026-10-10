import React from 'react';

export default function LoadingSkeleton({ title = 'Loading...' }) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs"
          >
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-7 w-32 bg-slate-300 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      <div className="h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-11 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
