'use client';

import React from 'react';

export default function Textarea({
  label,
  id,
  rows = 3,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full rounded-xl bg-white dark:bg-slate-900 border text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 p-3 focus-ring transition-colors ${
          error
            ? 'border-rose-400 focus:border-rose-500 ring-rose-400/20'
            : 'border-slate-200 dark:border-slate-800 focus:border-brand-primary'
        } ${disabled ? 'bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60' : ''} ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-[11px] font-medium text-rose-500">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
