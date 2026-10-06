import React, { useState } from 'react';
import { Store, ShieldCheck, Check, X, Award, DollarSign } from 'lucide-react';

export default function SellersPage() {
  const [sellers, setSellers] = useState([
    {
      _id: 's1',
      storeName: 'RoboTech Components Pvt Ltd',
      sellerName: 'RoboTech Admin',
      email: 'seller@projectkart.com',
      gstNumber: '27AAAAA0000A1Z5',
      rating: 4.9,
      totalSales: 340,
      totalRevenue: 154000,
      isApproved: true,
    },
    {
      _id: 's2',
      storeName: 'Embedded Micro Hub',
      sellerName: 'Amit Patel',
      email: 'amit@embeddedhub.in',
      gstNumber: '24BBBBB1111B2Z9',
      rating: 4.7,
      totalSales: 120,
      totalRevenue: 68000,
      isApproved: true,
    },
    {
      _id: 's3',
      storeName: 'IoT Sensor World',
      sellerName: 'Sneha Rao',
      email: 'sneha@sensorworld.com',
      gstNumber: '29CCCCC2222C3Z2',
      rating: 4.6,
      totalSales: 45,
      totalRevenue: 28000,
      isApproved: false,
    },
  ]);

  const toggleApproval = (id) => {
    setSellers((prev) =>
      prev.map((s) => (s._id === id ? { ...s, isApproved: !s.isApproved } : s))
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Seller Management & Applications</h1>
        <p className="text-sm text-slate-400">Verify electronics component suppliers & marketplace partners</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sellers.map((seller) => (
          <div key={seller._id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  seller.isApproved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {seller.isApproved ? 'Verified Partner' : 'Pending Verification'}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">{seller.storeName}</h2>
              <p className="text-xs text-slate-400">{seller.sellerName} • {seller.email}</p>
              <p className="text-xs font-mono text-slate-500 mt-1">GST: {seller.gstNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-500 block">Total Revenue</span>
                <span className="font-bold text-emerald-400">₹{seller.totalRevenue.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Rating</span>
                <span className="font-bold text-amber-400">⭐ {seller.rating}</span>
              </div>
            </div>

            <button
              onClick={() => toggleApproval(seller._id)}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                seller.isApproved
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
              }`}
            >
              {seller.isApproved ? (
                <>
                  <X className="w-4 h-4" /> Suspend Seller Store
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Approve Seller Verification
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
