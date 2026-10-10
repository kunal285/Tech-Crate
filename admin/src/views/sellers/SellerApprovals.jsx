import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, ShieldAlert } from 'lucide-react';
import { sellerService } from '../../services/sellerService';

export default function SellerApprovals() {
  const [pendingSellers, setPendingSellers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      const data = await sellerService.getSellers();
      setPendingSellers(data.filter((s) => !s.isApproved));
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    await sellerService.approveSeller(id);
    loadSellers();
  };

  const handleReject = async (id) => {
    await sellerService.rejectSeller(id);
    loadSellers();
  };

  return (
    <div className="p-8 space-y-6">
      <button
        onClick={() => navigate('/sellers')}
        className="flex items-center gap-2 text-sm text-cyan-400 font-semibold hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Sellers
      </button>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Pending Seller Applications</h1>
        <p className="text-sm text-slate-400">Review business credentials & approve new vendor accounts</p>
      </div>

      {pendingSellers.length === 0 ? (
        <div className="p-8 bg-slate-950 border border-slate-800 rounded-2xl text-center text-slate-400 text-sm">
          🎉 No pending seller applications awaiting review.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingSellers.map((s) => (
            <div key={s._id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div>
                <h2 className="font-bold text-white text-lg">{s.storeName}</h2>
                <p className="text-xs text-slate-400">{s.email}</p>
                <p className="text-xs font-mono text-slate-500 mt-1">GSTIN: {s.gstNumber || '29CCCCC2222C3Z2'}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleApprove(s._id)}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Approve Seller
                </button>
                <button
                  onClick={() => handleReject(s._id)}
                  className="flex-1 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs rounded-xl border border-rose-500/20 flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
