'use client';

import React from 'react';

export function Checkbox({
  label,
  id,
  checked,
  onChange,
  disabled = false,
  error,
  helperText,
  className = '',
  ...props
}) {
  const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1">
      <label htmlFor={checkboxId} className={`inline-flex items-center gap-2.5 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`w-4 h-4 rounded text-brand-primary border-slate-300 dark:border-slate-700 focus:ring-brand-primary focus:ring-offset-0 transition-colors ${className}`}
          {...props}
        />
        {label && (
          <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
            {label}
          </span>
        )}
      </label>
      {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
      {helperText && <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6">{helperText}</p>}
    </div>
  );
}

export function Switch({
  label,
  id,
  checked,
  onChange,
  disabled = false,
  helperText,
  className = '',
}) {
  const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-4">
        {label && (
          <label htmlFor={switchId} className={`text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 select-none cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {label}
          </label>
        )}
        <button
          type="button"
          id={switchId}
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange && onChange(!checked)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-ring ${
            checked ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              checked ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      {helperText && <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
}

export default { Checkbox, Switch };
