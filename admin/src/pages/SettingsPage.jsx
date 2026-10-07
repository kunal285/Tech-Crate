import React, { useState } from 'react';
import { Settings, Save, Percent, ShieldCheck, Mail, Phone, ToggleLeft, ToggleRight } from 'lucide-react';

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Configuration</h1>
        <p className="text-sm text-slate-400">Manage marketplace commissions, support contact lines, and shipping thresholds</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Platform settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Marketplace Fee */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Percent className="w-5 h-5 text-cyan-400" /> Marketplace Fee & Vendor Revenue Share
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Platform Commission Percentage (%)
            </label>
            <input
              type="text"
              value={commissionFee}
              onChange={(e) => setCommissionFee(e.target.value)}
              className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            <p className="text-xs text-slate-500 mt-1">Deducted automatically from seller payouts for each completed order.</p>
          </div>
        </div>

        {/* Shipping & Thresholds */}
        <div className="border-t border-slate-800/80 pt-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" /> Logistics & Shipping Thresholds
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Free Shipping Order Minimum (₹)
            </label>
            <input
              type="text"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Support Hotline & Inquiries */}
        <div className="border-t border-slate-800/80 pt-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-400" /> Customer Support Contacts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Hotline Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Platform Maintenance Mode */}
        <div className="border-t border-slate-800/80 pt-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Maintenance Mode</h3>
            <p className="text-xs text-slate-400">Put consumer storefront in read-only mode during maintenance windows.</p>
          </div>
          <button
            type="button"
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`p-1 rounded-xl transition-colors ${maintenanceMode ? 'text-cyan-400' : 'text-slate-500'}`}
          >
            {maintenanceMode ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Save className="w-5 h-5" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
