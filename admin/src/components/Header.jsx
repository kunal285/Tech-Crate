import React from 'react';
import { Bell, Search, ShieldCheck } from 'lucide-react';
import { useAdminAuthStore } from '../store/adminAuthStore';

export default function Header() {
  const admin = useAdminAuthStore((state) => state.admin);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search products, orders, users..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
        />
      </div>

      {/* Right User & System Controls */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        </button>

        <div className="h-6 w-px bg-slate-800"></div>

        <div className="flex items-center gap-3">
          <img
            src={
              admin?.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
            }
            alt="Admin"
            className="w-9 h-9 rounded-full object-cover border border-cyan-500/30"
          />
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-slate-100">{admin?.name || 'Master Admin'}</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xs text-slate-400">{admin?.email || 'admin@projectkart.com'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
