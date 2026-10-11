'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Bell,
  CreditCard,
  Gift,
  ShieldCheck,
  Check,
  Lock,
} from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export default function PreferencesAndWalletSection({ user }) {
  // Language & Region state
  const [selectedLang, setSelectedLang] = useState('English (India)');

  // Notification Preferences (Persisted in localStorage)
  const [notifs, setNotifs] = useState({
    orderUpdates: true,
    hardwareRestocks: true,
    makerDiscounts: false,
    technicalAnswers: true,
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('techcrate_notif_prefs');
      if (stored) {
        setNotifs(JSON.parse(stored));
      }
      const storedLang = localStorage.getItem('techcrate_lang_pref');
      if (storedLang) {
        setSelectedLang(storedLang);
      }
    } catch {}
  }, []);

  const handleToggleNotif = (key) => {
    setNotifs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('techcrate_notif_prefs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    try {
      localStorage.setItem('techcrate_lang_pref', lang);
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* 1. Language & Localization Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Language & Regional Settings</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Display language and currency formatting.
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700">
            INR (₹)
          </span>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'en-IN', name: 'English (India)', native: 'Primary' },
            { id: 'hi-IN', name: 'हिन्दी (Hindi)', native: 'Regional' },
            { id: 'en-US', name: 'English (International)', native: 'Global' },
          ].map((item) => {
            const isSelected = selectedLang === item.name;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLangChange(item.name)}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                }`}
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.name}</h4>
                  <p className="text-[10px] text-slate-500">{item.native}</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Notification Preferences Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Notification & Dispatch Alerts</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure order tracking and restock alerts.
          </p>
        </div>

        <div className="p-5 sm:p-6 divide-y divide-slate-100">
          {[
            {
              key: 'orderUpdates',
              title: 'Order Tracking & Shipment Updates',
              desc: 'Receive dispatch status, courier tracking, and out-for-delivery notifications.',
            },
            {
              key: 'hardwareRestocks',
              title: 'Back-in-Stock Alerts',
              desc: 'Get notified when high-demand microcontrollers and sensors are restocked.',
            },
            {
              key: 'makerDiscounts',
              title: 'Educational & Seasonal Offers',
              desc: 'Component bundle discounts and seasonal project kit promotions.',
            },
            {
              key: 'technicalAnswers',
              title: 'Technical Discussion Updates',
              desc: 'Notifications when inquiries regarding datasheets or pinouts are answered.',
            },
          ].map((item) => (
            <div
              key={item.key}
              className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
            >
              <div className="space-y-0.5 max-w-xl">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={notifs[item.key]}
                onClick={() => handleToggleNotif(item.key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifs[item.key] ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    notifs[item.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Payments & Wallet Status */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>Payments & Store Credits</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of store credits, vouchers, and payment gateway security.
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Gift className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Gift Cards & Vouchers</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              No active gift cards or store credit vouchers are linked to this account. Promotional coupon codes can be applied directly at checkout.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
            <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">
                Tokenized Payment Security (PCI-DSS Compliant)
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Online payments are processed directly through secure payment gateways (Razorpay, Cashfree, UPI). For your security, raw card details, CVVs, and UPI PINs are never stored on Tech Crate servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
