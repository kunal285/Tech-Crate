'use client';

import React from 'react';

export default function Select({
  label,
  id,
  options = [],
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <select
        id={selectId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full rounded-xl bg-white dark:bg-slate-900 border text-xs sm:text-sm text-slate-900 dark:text-slate-100 px-3.5 py-2 focus-ring transition-colors ${
          error
            ? 'border-rose-400 focus:border-rose-500'
            : 'border-slate-200 dark:border-slate-800 focus:border-brand-primary'
        } ${disabled ? 'bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60' : ''} ${className}`}
        {...props}
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              {label}
            </option>
          );
        })}
      </select>

      {error ? (
        <p className="text-[11px] font-medium text-rose-500">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
