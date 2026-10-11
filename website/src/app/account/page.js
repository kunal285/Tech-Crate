'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Package,
  Heart,
  LogOut,
  MapPin,
  Check,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Copy,
  Zap,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    college: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [recentOrdersCount, setRecentOrdersCount] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/account/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        college: user.college || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || '',
      });

      api
        .get('/orders/myorders')
        .then((res) => {
          if (Array.isArray(res.data)) {
            setRecentOrdersCount(res.data.length);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyUserId = () => {
    const idToCopy = user?._id || user?.id || 'TC-USR-9281';
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const ok = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      college: formData.college,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
    });
    setIsUpdating(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} />
      </div>
    );
  }

  const displayName = user?.name || 'Maker Engineer';
  const displayEmail = user?.email || 'maker@TechCrate.com';
  const userRole = (user?.role || 'Customer').toUpperCase();

  const menuSections = [
    {
      title: 'Orders & Shopping',
      items: [
        {
          title: 'My Orders & Shipments',
          subtitle: `Track live status & past hardware orders (${recentOrdersCount} orders)`,
          icon: Package,
          href: '/orders',
        },
        {
          title: 'My Saved Wishlist',
          subtitle: 'Components, boards & kits saved for later',
          icon: Heart,
          href: '/wishlist',
        },
        {
          title: 'Shopping Cart',
          subtitle: 'Manage items currently ready for checkout',
          icon: MapPin,
          href: '/cart',
        },
      ],
    },
    {
      title: 'Maker & Developer Tools',
      items: [
        {
          title: 'Engineering Project Hub',
          subtitle: 'IoT, Robotics & Embedded systems builders',
          icon: Zap,
          href: '/projects',
        },
        {
          title: 'AI Shopping Assistant',
          subtitle: 'Get component suggestions & project estimates',
          icon: Bell,
          href: '/ai-assistant',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Profile Info Card (Matches Mobile Profile Info Card) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-sm"
              style={{ backgroundColor: BRAND.navy }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div
              className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase text-white shadow-sm"
              style={{ backgroundColor: BRAND.orange }}
            >
              {userRole}
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {displayName}
            </h1>
            <p className="text-xs text-slate-500">{displayEmail}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {/* User ID copy pill */}
              <button
                type="button"
                onClick={handleCopyUserId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span>ID: {String(user?._id || user?.id || 'TC-USR-9281').slice(-8)}</span>
                <Copy className="w-3 h-3 text-sky-600" />
                {copiedId && <span className="text-[10px] text-emerald-600">Copied!</span>}
              </button>

              {/* College Tag */}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-50 border border-slate-200 text-slate-700">
                <GraduationCap className="w-3.5 h-3.5" style={{ color: BRAND.navy }} />
                <span>{user?.college || 'Engineering Institute'}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold text-xs border border-slate-200 transition-colors shadow-2xs"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 2. Menu Navigation Groups (Matches Mobile menuSections) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider px-1">
              {section.title}
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className="flex items-center justify-between p-4 hover:bg-slate-50/70 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${BRAND.navy}0D`,
                          color: BRAND.navy,
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Delivery Details & Profile Settings Form */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Default Shipping & Campus Address
            </h2>
            <p className="text-xs text-slate-500">
              Save your address for faster 1-click checkout on future orders.
            </p>
          </div>
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved successfully
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-brand-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-brand-primary"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              College / Institute
            </label>
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              placeholder="e.g. IIT Bombay / BITS Pilani"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-brand-primary"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Street / Campus Address
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="e.g. Hostel 4, Room 210"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-brand-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-brand-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Pincode
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-brand-primary"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: BRAND.navy }}
            >
              {isUpdating ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
