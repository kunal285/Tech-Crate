'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Tag,
  Cpu,
  Star,
  ShoppingCart,
  RotateCcw,
  CreditCard,
  Store,
  Ticket,
  Image as ImageIcon,
  Bell,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { isRouteAllowed } from '../constants/permissions';

export default function Sidebar({ isOpen, onClose }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('tc_admin_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch (e) {}
  }, []);

  const toggleCollapsed = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    try {
      localStorage.setItem('tc_admin_sidebar_collapsed', String(nextState));
    } catch (e) {}
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    if (onClose) onClose();
  };

  const userRole = user?.role || 'super_admin';

  // Grouped Navigation Structure
  const navigationGroups = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
      ],
    },
    {
      group: 'Catalog',
      items: [
        { label: 'Products & Stock', path: '/products', icon: Package },
        { label: 'Categories', path: '/categories', icon: Tag },
        { label: 'Projects & Kits', path: '/projects', icon: Cpu },
        { label: 'Customer Reviews', path: '/reviews', icon: Star },
      ],
    },
    {
      group: 'Sales & Operations',
      items: [
        { label: 'Orders', path: '/orders', icon: ShoppingCart },
        { label: 'Replacement Claims', path: '/replacements', icon: RotateCcw },
        { label: 'Payments', path: '/payments', icon: CreditCard },
      ],
    },
    {
      group: 'Marketplace',
      items: [
        { label: 'Sellers & Vendors', path: '/sellers', icon: Store },
      ],
    },
    {
      group: 'Marketing',
      items: [
        { label: 'Coupons & Discounts', path: '/coupons', icon: Ticket },
        { label: 'Banners & Posters', path: '/banners', icon: ImageIcon },
        { label: 'Push Notifications', path: '/notifications', icon: Bell },
      ],
    },
    {
      group: 'Administration',
      items: [
        { label: 'Users & Roles', path: '/users', icon: Users },
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  // Filter groups and items by RBAC permissions
  const filteredGroups = navigationGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => isRouteAllowed(userRole, item.path)),
    }))
    .filter((g) => g.items.length > 0);

  const collapsedWidth = isCollapsed ? 'lg:w-[76px]' : 'lg:w-64';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-50 lg:z-auto h-screen ${collapsedWidth} w-64 bg-white dark:bg-[#060D1A] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Brand Header */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between flex-shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 overflow-hidden group focus-ring rounded-lg"
              title="Tech Crate Admin Console"
            >
              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Image
                  src="/logo.png"
                  alt="Tech Crate"
                  width={36}
                  height={36}
                  className="object-contain p-0.5"
                  priority
                />
              </div>

              {(!isCollapsed || !mounted) && (
                <div className="flex flex-col min-w-0 transition-opacity duration-200">
                  <span className="text-base font-extrabold text-[#032762] dark:text-blue-400 tracking-tight leading-tight truncate">
                    Tech Crate
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Control Center
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Scroll Container */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {filteredGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {(!isCollapsed || !mounted) && (
                  <div className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {group.group}
                  </div>
                )}

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === '/dashboard'
                      ? pathname === '/dashboard' || pathname === '/'
                      : pathname === item.path || pathname.startsWith(`${item.path}/`);

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onClose}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 group relative ${
                        isActive
                          ? 'bg-brand-primary text-white font-semibold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-110'}`} />

                      {(!isCollapsed || !mounted) && (
                        <span className="truncate">{item.label}</span>
                      )}

                      {/* Tooltip on Collapsed Desktop View */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Collapse Toggle & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
          {/* Collapse/Expand Toggle (Desktop only) */}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-white transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 mx-auto" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>

          {/* Quick Sign Out */}
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {(!isCollapsed || !mounted) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
