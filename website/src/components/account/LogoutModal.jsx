'use client';

import React, { useEffect } from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export default function LogoutModal({ isOpen, onClose, onConfirm, isLoggingOut }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-5 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 id="logout-dialog-title" className="text-base font-bold text-slate-900">
                Sign Out of Tech Crate?
              </h3>
              <p className="text-xs text-slate-500">
                You will need to sign in again to access orders and saved items.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Active Session Notice</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Your shopping cart items are securely saved. Any active order notifications will continue to reach your registered email & phone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-98 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-98 disabled:opacity-50 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? 'Signing out...' : 'Yes, Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
