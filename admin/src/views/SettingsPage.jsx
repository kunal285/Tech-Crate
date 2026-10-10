'use client';

import React, { useState } from 'react';
import {
  Settings,
  Save,
  Percent,
  ShieldCheck,
  Mail,
  Phone,
  Truck,
  Power,
  Sliders,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function SettingsPage() {
  const [commissionFee, setCommissionFee] = useState('8.5');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('999');
  const [supportEmail, setSupportEmail] = useState('support@techcrate.com');
  const [supportPhone, setSupportPhone] = useState('1800-TECHCRATE');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <PageHeader
        title="Platform Configuration"
        subtitle="Manage marketplace commission rules, customer support contact channels, and shipping thresholds"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Settings' }]}
      />

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2.5 shadow-xs">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span className="font-semibold">Platform settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Marketplace Fee Card */}
        <Card className="p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-brand-primary dark:text-blue-400 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Marketplace Fee & Vendor Revenue Share
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deducted automatically from seller payouts for each completed order
              </p>
            </div>
          </div>

          <div className="max-w-xs pt-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Platform Commission Percentage (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={commissionFee}
                onChange={(e) => setCommissionFee(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary tabular-nums"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">
                %
              </span>
            </div>
          </div>
        </Card>

        {/* Shipping & Thresholds Card */}
        <Card className="p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Logistics & Shipping Thresholds
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Order minimum for student makers to receive free expedited surface delivery
              </p>
            </div>
          </div>

          <div className="max-w-xs pt-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Free Shipping Order Minimum (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">
                ₹
              </span>
              <input
                type="number"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary tabular-nums"
              />
            </div>
          </div>
        </Card>

        {/* Support Hotline & Inquiries Card */}
        <Card className="p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Customer Support Contacts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Published on order invoices and consumer inquiry receipts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Hotline Phone
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
          </div>
        </Card>

        {/* Platform Maintenance Mode Card */}
        <Card className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Maintenance Mode
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Put consumer storefront in read-only mode during database migrations
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${
                maintenanceMode ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={Save}
          >
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
