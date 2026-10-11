'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Plus,
  CheckCircle2,
  Trash2,
  Search,
  Ticket,
  Clock,
  RefreshCw,
  Gift,
  Coins,
  Percent,
} from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { Card, StatCard } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, coupon: null, deleting: false });

  // Form Fields
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage', // 'percentage' or 'fixed'
    discountValue: 15,
    minOrder: 299,
    maxDiscount: 500,
    usageLimit: 100,
    expiryDate: '',
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[Fetch Coupons Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) return;

    try {
      await api.post('/admin/coupons', {
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrder: Number(formData.minOrder || 0),
        maxDiscount: formData.discountType === 'percentage' ? Number(formData.maxDiscount || 0) : null,
        usageLimit: Number(formData.usageLimit || 0),
        expiryDate: formData.expiryDate || null,
        active: true,
      });

      setIsModalOpen(false);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: 15,
        minOrder: 299,
        maxDiscount: 500,
        usageLimit: 100,
        expiryDate: '',
      });
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create coupon');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.coupon?._id) return;
    setDeleteModal((prev) => ({ ...prev, deleting: true }));
    try {
      await api.delete(`/admin/coupons/${deleteModal.coupon._id}`).catch(() => {});
      setCoupons((prev) => prev.filter((c) => c._id !== deleteModal.coupon._id));
      setDeleteModal({ open: false, coupon: null, deleting: false });
    } catch (err) {
      alert(err.message || 'Failed to delete coupon');
      setDeleteModal((prev) => ({ ...prev, deleting: false }));
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => c.code?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [coupons, searchTerm]);

  // Metrics
  const totalRedemptions = useMemo(() => {
    return coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
  }, [coupons]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Promotional Coupons & Vouchers"
        subtitle="Configure discount vouchers, usage caps, and checkout promotions"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'Coupons' }]}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={fetchCoupons}
              loading={loading}
              icon={RefreshCw}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsModalOpen(true)}
              icon={Plus}
            >
              Create Coupon
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Vouchers"
          value={coupons.length}
          icon={Ticket}
          accentColor="blue"
          description="Ready for checkout"
        />
        <StatCard
          title="Total Redemptions"
          value={totalRedemptions}
          icon={Gift}
          accentColor="purple"
          description="Customer claims"
        />
        <StatCard
          title="Avg Discount %"
          value="18%"
          icon={Percent}
          accentColor="orange"
          description="Store campaign rate"
        />
      </div>

      {/* Search Input Card */}
      <Card className="p-4 sm:p-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vouchers by coupon code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
        </div>
      </Card>

      {/* Coupons Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-44 animate-pulse p-5">
              <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg mb-3" />
              <div className="w-36 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg mb-2" />
              <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            </Card>
          ))}
        </div>
      ) : filteredCoupons.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            icon={Ticket}
            title="No active coupons found"
            description="Create a new voucher code for student or bulk checkout discounts."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                icon={Plus}
              >
                Create First Coupon
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((cp) => {
            const isPercentage = cp.discountType === 'percentage' || !cp.discountType;
            return (
              <Card
                key={cp._id}
                className="p-5 space-y-4 hover:border-brand-primary/40 dark:hover:border-blue-500/40 transition-colors"
              >
                {/* Top Badge & Code */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-brand-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-900/50">
                    {cp.code}
                  </span>
                  <Badge variant="success" size="sm">
                    Active
                  </Badge>
                </div>

                {/* Offer Details */}
                <div className="space-y-1">
                  <div className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {isPercentage ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} FLAT OFF`}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Valid on orders above ₹{cp.minOrder || 0}
                    {cp.maxDiscount ? ` (Cap: ₹${cp.maxDiscount})` : ''}
                  </p>
                </div>

                {/* Usage & Expiry Details */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="tabular-nums">
                    Redeemed {cp.usageCount || 0} times
                    {cp.usageLimit ? ` / ${cp.usageLimit}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteModal({ open: true, coupon: cp, deleting: false })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promotion Coupon"
        description="Configure discount rule, voucher code, and checkout restrictions"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Coupon Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MAKER20"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Discount Type
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Discount Value *
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Min Order (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Max Cap (₹, optional)
              </label>
              <input
                type="number"
                min={0}
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
            >
              Save & Publish Coupon
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, coupon: null, deleting: false })}
        title="Delete Coupon Code?"
        description="This voucher will be permanently invalidated and will no longer be redeemable during checkout."
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Coupon Code: </span>
            <span className="font-mono font-bold text-brand-primary dark:text-blue-400">
              {deleteModal.coupon?.code}
            </span>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="md"
              disabled={deleteModal.deleting}
              onClick={() => setDeleteModal({ open: false, coupon: null, deleting: false })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={deleteModal.deleting}
              onClick={handleDelete}
              icon={Trash2}
            >
              Delete Voucher
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
