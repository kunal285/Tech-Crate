'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Heart,
  Bot,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Layers,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES } from '@/lib/constants';

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Morning';
  if (h >= 12 && h < 17) return 'Afternoon';
  if (h >= 17 && h < 21) return 'Evening';
  return 'Night';
}

export default function Header() {
  const router = useRouter();
  const { totalCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const [greeting, setGreeting] = useState(getGreeting);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    setGreeting(getGreeting());
    const interval = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('techcrate_wishlist');
      if (stored) {
        const arr = JSON.parse(stored);
        setWishlistCount(Array.isArray(arr) ? arr.length : 0);
      }
    } catch {}
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Maker';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* 1. Mobile App Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Left: Logo & Dynamic Time Greeting */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center shadow-xs">
              <Image
                src="/logo.png"
                alt="Tech Crate"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 line-clamp-1">
                Good {greeting}, {displayName}!
              </span>
              <span className="text-base sm:text-lg font-extrabold text-[#032762] tracking-tight leading-tight">
                Tech Crate
              </span>
            </div>
          </Link>

          {/* Center: Search Bar Pill (Desktop & Tablet) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md items-center bg-slate-50 border border-slate-200 rounded-full pl-3.5 pr-1.5 py-1 focus-within:border-[#032762] focus-within:ring-2 focus-within:ring-[#032762]/10 transition-all"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, projects, kits..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-full bg-[#032762] hover:bg-[#034697] text-white text-xs font-bold transition-colors ml-1 shadow-xs"
            >
              Filter
            </button>
          </form>

          {/* Right: Circular Action Icons Matching Mobile App Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* AI Assistant Link */}
            <Link
              href="/projects"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-[#032762] flex items-center justify-center transition-colors relative"
              title="AI Project Assistant"
            >
              <Bot className="w-5 h-5" />
            </Link>

            {/* Wishlist Icon with Orange Badge */}
            <Link
              href="/wishlist"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors relative"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F97316] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border-2 border-white min-w-[18px] text-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Icon with Orange Badge */}
            <Link
              href="/cart"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F97316] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border-2 border-white min-w-[18px] text-center">
                  {totalCount > 99 ? '99+' : totalCount}
                </span>
              )}
            </Link>

            {/* User Account Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors border border-slate-200"
                title="Account"
              >
                <User className="w-5 h-5" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs sm:text-sm"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Maker Account</span>
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <Package className="w-4 h-4 text-slate-500" />
                        <span>My Orders</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/account/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-slate-800 font-semibold hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-brand-primary" />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        href="/account/register"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 border-t border-slate-100"
                      >
                        <span>Create Account</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row (When on phone screens) */}
        <div className="pb-3 md:hidden">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-slate-50 border border-slate-200 rounded-full pl-3.5 pr-1 py-1 focus-within:border-[#032762]"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, projects, kits..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-full bg-[#032762] text-white text-[11px] font-bold"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* 2. Secondary Navigation Ribbon (Desktop / Tablet) */}
      <nav className="hidden md:block bg-slate-50 border-t border-slate-100 text-xs font-semibold text-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10 gap-4">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-1 min-w-0 flex-1">
            <Link href="/products" className="hover:text-[#032762] transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap">
              <span>All Hardware</span>
            </Link>
            <Link
              href="/products?category=Microcontrollers"
              className="hover:text-[#032762] transition-colors shrink-0 whitespace-nowrap"
            >
              Microcontrollers
            </Link>
            <Link
              href="/products?category=Sensors"
              className="hover:text-[#032762] transition-colors shrink-0 whitespace-nowrap"
            >
              Sensors
            </Link>
            <Link
              href="/products?category=Motors%20%26%20Drivers"
              className="hover:text-[#032762] transition-colors shrink-0 whitespace-nowrap"
            >
              Motors & Drivers
            </Link>
            <Link
              href="/products?category=Wireless%20%26%20IoT"
              className="hover:text-[#032762] transition-colors shrink-0 whitespace-nowrap"
            >
              Wireless & IoT
            </Link>
            <Link
              href="/projects"
              className="text-[#F97316] hover:text-orange-600 transition-colors flex items-center gap-1 font-bold shrink-0 whitespace-nowrap"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>DIY Project Kits</span>
            </Link>
          </div>

          <div className="text-[11px] text-slate-500 font-medium shrink-0 whitespace-nowrap">
            ⚡ Free delivery above <strong className="text-slate-800 font-bold">₹499</strong>
          </div>
        </div>
      </nav>

      {/* 3. Mobile Collapsible Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-2 text-sm">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-semibold"
          >
            All Hardware
          </Link>
          <Link
            href="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#F97316] font-bold"
          >
            DIY Projects & Code Hub
          </Link>
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Categories
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-[#032762]"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
