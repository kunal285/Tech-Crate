'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  ShieldCheck,
  Menu,
  User,
  LogOut,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import ThemeToggle from './ThemeToggle';

export default function Header({ onMenuToggle }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim();
    // Intelligently route based on search terms
    if (/^\d+$/.test(q) || q.toLowerCase().startsWith('tc-')) {
      router.push(`/orders?search=${encodeURIComponent(q)}`);
    } else {
      router.push(`/products?search=${encodeURIComponent(q)}`);
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    router.push('/login');
  };

  const userName = mounted && user?.name ? user.name : 'Master Admin';
  const userEmail = mounted && user?.email ? user.email : 'admin@techcrate.com';
  const userRole = mounted && user?.role ? user.role : 'super_admin';
  const userAvatar =
    mounted && user?.avatar
      ? user.avatar
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80';

  const formatRoleLabel = (role) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'Super Admin';
      case 'store_manager':
        return 'Store Manager';
      case 'order_staff':
        return 'Order Fulfillment';
      case 'support':
        return 'Customer Support';
      case 'finance':
        return 'Finance Manager';
      default:
        return role;
    }
  };

  const getRoleBadgeClasses = (role) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
      case 'store_manager':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
      case 'order_staff':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      case 'finance':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-150">
      {/* Left: Mobile Menu Toggle & Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 lg:hidden transition-colors"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Global admin search"
            placeholder="Search orders, SKU, products, customers..."
            className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-full pl-10 pr-4 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 transition-all"
          />
        </form>
      </div>

      {/* Right: Storefront Link, Theme Switcher, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Link to Customer Storefront */}
        <a
          href="https://tech-crate-tau.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Customer Storefront"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
        >
          <span>Live Store</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        {/* Theme Toggle (Light / Dark) */}
        <ThemeToggle />

        {/* Notifications Bell */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          aria-label="Push notifications"
          title="Notification Center"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
        </Link>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* User Account & Role Badge Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <Image
              src={userAvatar}
              alt={userName}
              width={34}
              height={34}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
            />
            <div className="text-left hidden lg:block pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                  {userName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span
                className={`inline-block px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider rounded-md border ${getRoleBadgeClasses(
                  userRole
                )}`}
              >
                {formatRoleLabel(userRole)}
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{userName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
                <span
                  className={`mt-1.5 inline-block px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded border ${getRoleBadgeClasses(
                    userRole
                  )}`}
                >
                  {formatRoleLabel(userRole)}
                </span>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Platform Settings</span>
                </Link>
                <Link
                  href="/users"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Users & Access Control</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
