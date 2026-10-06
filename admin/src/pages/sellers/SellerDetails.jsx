import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, ShieldCheck, DollarSign } from 'lucide-react';

export default function SellerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-8 space-y-6">
      <button
        onClick={() => navigate('/sellers')}
        className="flex items-center gap-2 text-sm text-cyan-400 font-semibold hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Sellers
      </button>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">RoboTech Components Store</h1>
            <p className="text-sm text-slate-400">GSTIN: 27AAAAA0000A1Z5</p>
            <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified Partner Status: Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-sm">
          <div>
            <span className="text-slate-500 block">Total Sales Revenue</span>
            <span className="font-bold text-emerald-400 text-lg">₹1,54,000</span>
          </div>
          <div>
            <span className="text-slate-500 block">Active Listings</span>
            <span className="font-bold text-cyan-400 text-lg">18 Hardware Items</span>
          </div>
        </div>
      </div>
    </div>
  );
}
