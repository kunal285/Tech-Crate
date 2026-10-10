import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';

export default function ProductApproval() {
  const navigate = useNavigate();

  const pendingProducts = [
    { _id: 'pa1', title: 'STM32F103C8T6 Blue Pill Board', seller: 'Embedded Micro Hub', price: 299 },
    { _id: 'pa2', title: 'VL53L0X Time-of-Flight Distance Sensor', seller: 'IoT Sensor World', price: 349 },
  ];

  return (
    <div className="p-8 space-y-6">
      <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-sm text-cyan-400 font-semibold hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Pending Product Approvals</h1>
        <p className="text-sm text-slate-400">Review component listings submitted by verified marketplace sellers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pendingProducts.map((p) => (
          <div key={p._id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-bold text-white text-base">{p.title}</h2>
                <p className="text-xs text-slate-400">Submitted by: {p.seller}</p>
              </div>
              <span className="font-bold text-emerald-400 text-base">₹{p.price}</span>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1">
                <Check className="w-4 h-4" /> Approve Listing
              </button>
              <button className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs rounded-xl border border-rose-500/20 flex items-center justify-center gap-1">
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
