import React from 'react';
import { Bell, Search, ShieldCheck, Menu } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Header({ onMenuToggle }) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Menu Toggle & Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 lg:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-48 sm:w-72 md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            aria-label="Global admin search"
            placeholder="Search platform..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right User & System Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        </button>

        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
            }
            alt={user?.name || 'Admin'}
            className="w-9 h-9 rounded-full object-cover border border-cyan-500/30 flex-shrink-0"
          />
          <div className="text-left hidden md:block">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-slate-100">{user?.name || 'Master Admin'}</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xs text-slate-400">{user?.email || 'admin@TechCrate.com'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
