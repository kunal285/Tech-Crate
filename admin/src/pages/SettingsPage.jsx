import React, { useState } from 'react';
import { Settings, Save, Bot, Percent, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [commissionFee, setCommissionFee] = useState('8.5');
  const [aiApiKey, setAiApiKey] = useState('pk_live_gemini_api_key_8492019482');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('999');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Configuration</h1>
        <p className="text-sm text-slate-400">Manage marketplace commissions, AI endpoints, and shipping rates</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Platform settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Percent className="w-5 h-5 text-cyan-400" /> Marketplace Fee & Revenue Share
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
            <p className="text-xs text-slate-500 mt-1">Deducted automatically from seller payouts for every component order.</p>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" /> AI Assistant Configuration
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Gemini AI Hardware Knowledge Base Key
            </label>
            <input
              type="password"
              value={aiApiKey}
              onChange={(e) => setAiApiKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
            <p className="text-xs text-slate-500 mt-1">Powers ProjectKart AI Project Assistant & Component Compatibility verification.</p>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" /> Shipping & Logistics Thresholds
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
