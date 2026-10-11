'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Package,
  MapPin,
  Lock,
  Sliders,
  HelpCircle,
  LogOut,
  Loader2,
  Activity,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

import ProfileHeader from '@/components/account/ProfileHeader';
import QuickAccessGrid from '@/components/account/QuickAccessGrid';
import PersonalDetailsForm from '@/components/account/PersonalDetailsForm';
import OrdersSummarySection from '@/components/account/OrdersSummarySection';
import SecuritySessionsSection from '@/components/account/SecuritySessionsSection';
import PreferencesAndWalletSection from '@/components/account/PreferencesAndWalletSection';
import MyActivitySection from '@/components/account/MyActivitySection';
import HelpAndFaqSection from '@/components/account/HelpAndFaqSection';
import LogoutModal from '@/components/account/LogoutModal';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'profile' | 'security' | 'preferences' | 'help'
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Authentication Guard
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/account/login?redirect=/account');
    }
  }, [isAuthenticated, loading, router]);

  // Load real counts
  useEffect(() => {
    if (user) {
      // 1. Order count from API
      api
        .get('/orders/myorders')
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : res.data?.orders || [];
          setOrdersCount(list.length);
        })
        .catch(() => {});

      // 2. Wishlist count from localStorage
      try {
        const stored = localStorage.getItem('techcrate_wishlist');
        if (stored) {
          const arr = JSON.parse(stored);
          setWishlistCount(Array.isArray(arr) ? arr.length : 0);
        }
      } catch {}
    }
  }, [user]);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch {
      router.push('/');
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const addressSummary = useMemo(() => {
    if (!user?.address) return null;
    const parts = [user.address.city, user.address.state, user.address.pincode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[460px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-semibold text-slate-500">
          Loading your Tech Crate maker dashboard...
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: Activity },
    { id: 'orders', label: 'Orders & Dispatches', icon: Package, badge: ordersCount > 0 ? ordersCount : null },
    { id: 'profile', label: 'Personal & Shipping', icon: MapPin },
    { id: 'security', label: 'Security & Devices', icon: Lock },
    { id: 'preferences', label: 'Preferences & Wallet', icon: Sliders },
    { id: 'help', label: 'Help & Policies', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Profile Header Component */}
      <ProfileHeader
        user={user}
        onEditProfileClick={() => setActiveTab('profile')}
      />

      {/* 2. Quick Access Action Grid */}
      <QuickAccessGrid
        ordersCount={ordersCount}
        wishlistCount={wishlistCount}
        addressSummary={addressSummary}
        onAddressClick={() => setActiveTab('profile')}
        onSupportClick={() => setActiveTab('help')}
      />

      {/* 3. Modern Segmented Tab Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-1.5 shadow-xs overflow-x-auto scrollbar-none flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sign Out Button in Tab Strip */}
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ml-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>

      {/* 4. Active Tab Content Pane */}
      <div className="transition-all duration-150">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <OrdersSummarySection />
            <PersonalDetailsForm user={user} onUpdateProfile={updateProfile} />
            <MyActivitySection />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <OrdersSummarySection />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <PersonalDetailsForm user={user} onUpdateProfile={updateProfile} />
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <SecuritySessionsSection user={user} />
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <PreferencesAndWalletSection user={user} />
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-6">
            <HelpAndFaqSection />
          </div>
        )}
      </div>

      {/* 5. Account Footer & Build Attribution */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Tech Crate Security Shield • Encrypted Session for {user.email || user.name || 'Account'}
          </span>
        </div>
        <div>
          <span>Tech Crate Web v1.0.0 • Build 2026.04 • Verified Electronic Components</span>
        </div>
      </div>

      {/* 6. Accessible Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </div>
  );
}
