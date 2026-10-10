'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/admin/payments');
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Payment Transactions & Gateway Logs</h1>
        <p className="text-sm text-slate-400">Monitor Razorpay & online transactions securely</p>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
              <th className="p-4">Transaction ID</th>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Gateway</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {payments.map((p) => (
              <tr key={p._id} className="hover:bg-slate-900/50 transition-all">
                <td className="p-4 font-mono text-cyan-400 font-semibold">{p._id}</td>
                <td className="p-4 font-mono text-slate-300">{p.orderId}</td>
                <td className="p-4 font-semibold text-white">{p.customerName}</td>
                <td className="p-4 font-bold text-emerald-400">₹{p.amount}</td>
                <td className="p-4 text-slate-300">{p.paymentMethod || 'Auto UPI Gateway'}</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-max">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
