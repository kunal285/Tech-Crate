'use client';

import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose && onClose();
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm transition-opacity"
    >
      <div
        ref={modalRef}
        className={`w-full ${sizeStyles[size] || sizeStyles.md} bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            {title && (
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you absolutely sure?',
  message = 'This action cannot be undone and will permanently modify the records.',
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  danger = true,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center space-y-3 pt-2 pb-1">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          danger
            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'
            : 'bg-blue-50 dark:bg-blue-950/40 text-brand-primary border border-blue-200 dark:border-blue-900/40'
        }`}>
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {message}
        </p>

        <div className="flex items-center gap-2.5 w-full pt-4">
          <Button
            variant="outline"
            className="flex-1"
            disabled={loading}
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            className="flex-1"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default { Modal, ConfirmDialog };
