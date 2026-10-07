import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Cpu,
  ShoppingCart,
  Users,
  Store,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  Tag,
  CreditCard,
  Star,
  Ticket,
  Image as ImageIcon,
  Bell,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Sidebar({ isOpen, onClose }) {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Sellers', path: '/sellers', icon: Store },
    { label: 'Products & Components', path: '/products', icon: Package },
    { label: 'Categories', path: '/categories', icon: Tag },
    { label: 'Projects & Kits', path: '/projects', icon: Cpu },
    { label: 'Orders', path: '/orders', icon: ShoppingCart },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Reviews', path: '/reviews', icon: Star },
    { label: 'Coupons', path: '/coupons', icon: Ticket },
    { label: 'Banners & Posters', path: '/banners', icon: ImageIcon },
    { label: 'Push Notifications', path: '/notifications', icon: Bell },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-50 lg:z-auto h-screen w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto">
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white tracking-wide">Tech Crate</h1>
                <p className="text-xs text-cyan-400 font-medium uppercase tracking-wider">Admin Web Panel</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            Logout Admin
          </button>
        </div>
      </aside>
    </>
  );
}
