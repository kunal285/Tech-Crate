'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error('[Admin Runtime Error]:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col justify-center items-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 shadow-xs">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Something Went Wrong</h2>
      <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md text-sm">
        An unexpected application error occurred while loading this view.
      </p>
      {error?.message && (
        <code className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-mono max-w-lg overflow-x-auto">
          {error.message}
        </code>
      )}
      <button
        onClick={() => reset()}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryDark text-white font-semibold text-sm transition-all shadow-xs"
      >
        <RefreshCw className="w-4 h-4" />
        Retry Action
      </button>
    </div>
  );
}
