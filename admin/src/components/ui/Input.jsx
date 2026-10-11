'use client';

import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full rounded-xl bg-white dark:bg-slate-900 border text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring transition-colors ${
            Icon ? 'pl-9 pr-3.5 py-2' : 'px-3.5 py-2'
          } ${
            error
              ? 'border-rose-400 focus:border-rose-500 ring-rose-400/20'
              : 'border-slate-200 dark:border-slate-800 focus:border-brand-primary'
          } ${disabled ? 'bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60' : ''} ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-[11px] font-medium text-rose-500">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
