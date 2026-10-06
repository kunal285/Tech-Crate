import React from 'react';

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border';
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-transparent shadow-lg shadow-cyan-500/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20',
    outline: 'bg-transparent border-slate-800 hover:bg-slate-900 text-slate-300',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
