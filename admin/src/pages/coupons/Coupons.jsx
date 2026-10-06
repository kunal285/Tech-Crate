import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState('');
  const [value, setValue] = useState('10');

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!code) return;
    try {
      await api.post('/admin/coupons', {
        code,
        discountType: 'percentage',
        discountValue: Number(value),
        minOrder: 200,
      });
      setCode('');
      fetchCoupons();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Promotional Coupons & Discounts</h1>
        <p className="text-sm text-slate-400">Create discount vouchers for students and hardware builders</p>
      </div>

      <form onSubmit={handleCreate} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex gap-4 max-w-xl">
        <input
          type="text"
          placeholder="Coupon Code (e.g. MAKER15)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
        />
        <input
          type="number"
          placeholder="Discount %"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-sm rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Voucher
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((cp) => (
          <div key={cp._id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">
                {cp.code}
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            <p className="text-sm text-white font-semibold">{cp.discountValue}% OFF on orders above ₹{cp.minOrder}</p>
            <p className="text-xs text-slate-400">{cp.usageCount || 0} times redeemed by students</p>
          </div>
        ))}
      </div>
    </div>
  );
}
