import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, CheckCircle, Clock } from 'lucide-react';
import { sellerService } from '../../services/sellerService';

export default function Sellers() {
  const [sellers, setSellers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      const data = await sellerService.getSellers();
      setSellers(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Verified Sellers & Stores</h1>
          <p className="text-sm text-slate-400">Manage hardware vendors, store applications, and revenue payouts</p>
        </div>
        <button
          onClick={() => navigate('/sellers/approvals')}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm rounded-xl flex items-center gap-2"
        >
          <Clock className="w-4 h-4" /> Pending Approvals
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sellers.map((s) => (
          <div key={s._id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.isApproved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                {s.isApproved ? 'Verified Partner' : 'Pending'}
              </span>
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">{s.storeName}</h2>
              <p className="text-xs text-slate-400">{s.email}</p>
              <p className="text-xs font-mono text-slate-500 mt-1">GST: {s.gstNumber}</p>
            </div>
            <button
              onClick={() => navigate(`/sellers/${s._id}`)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
            >
              View Full Store Profile →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
