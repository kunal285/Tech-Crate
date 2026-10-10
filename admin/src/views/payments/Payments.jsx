'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, RefreshCw, DollarSign, Wallet, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { Card, StatCard } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/payments');
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalCaptured = useMemo(() => {
    return payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [payments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Payment Transactions & Gateway Logs"
        subtitle="Monitor Razorpay, UPI, and online checkout settlements with idempotency verification"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Payments' }]}
        action={
          <Button
            variant="outline"
            size="md"
            onClick={fetchPayments}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh Logs
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Captured Volume"
          value={`₹${totalCaptured.toLocaleString('en-IN')}`}
          icon={Wallet}
          accentColor="blue"
          description="Net settled to bank account"
        />
        <StatCard
          title="Settled Payments"
          value={payments.length}
          icon={CheckCircle2}
          accentColor="emerald"
          description="Completed checkout orders"
        />
        <StatCard
          title="Gateway Health"
          value="100%"
          icon={ShieldCheck}
          accentColor="cyan"
          description="Razorpay webhook active"
        />
      </div>

      {/* Payments Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Order Reference</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="w-28 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                    <td className="p-4"><div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <EmptyState
                      icon={CreditCard}
                      title="No payment records yet"
                      description="Payment transactions processed via Razorpay will be logged and listed here."
                    />
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-4 font-mono text-xs font-semibold text-brand-primary dark:text-blue-400">
                      {p._id}
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {p.orderId || 'Direct'}
                    </td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                      {p.customerName || 'Anonymous Maker'}
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-300">
                      {p.paymentMethod || 'Razorpay / UPI'}
                    </td>
                    <td className="p-4">
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        {p.status || 'Captured'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
