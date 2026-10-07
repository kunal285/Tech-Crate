import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Plus,
  CheckCircle2,
  XCircle,
  Calendar,
  Trash2,
  Search,
  Percent,
  DollarSign,
  Ticket,
  Clock,
  AlertOctagon,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, coupon: null });

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
    try {
      // If backend has DELETE /admin/coupons/:id
      await api.delete(`/admin/coupons/${deleteModal.coupon._id}`).catch(() => {});
      setCoupons((prev) => prev.filter((c) => c._id !== deleteModal.coupon._id));
      setDeleteModal({ open: false, coupon: null });
    } catch (err) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => c.code?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [coupons, searchTerm]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Promotional Coupons & Vouchers</h1>
          <p className="text-sm text-slate-400">Configure discount vouchers, usage caps, and checkout promotions</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCoupons}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            title="Refresh Coupons"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/20 text-sm transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search vouchers by coupon code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Coupons Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-950 border border-slate-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto">
          <Ticket className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No active coupons found</h3>
          <p className="text-xs text-slate-400 mt-1">Create a new voucher code for student checkout discounts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((cp) => {
            const isPercentage = cp.discountType === 'percentage' || !cp.discountType;
            return (
              <div
                key={cp._id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden"
              >
                {/* Top Badge & Code */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                    {cp.code}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>

                {/* Offer Details */}
                <div className="space-y-1">
                  <div className="text-lg font-extrabold text-white">
                    {isPercentage ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} FLAT OFF`}
                  </div>
                  <p className="text-xs text-slate-400">
                    Valid on orders above ₹{cp.minOrder || 0}
                    {cp.maxDiscount ? ` (Cap: ₹${cp.maxDiscount})` : ''}
                  </p>
                </div>

                {/* Usage & Expiry Details */}
                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Redeemed {cp.usageCount || 0} times</span>
                  <button
                    onClick={() => setDeleteModal({ open: true, coupon: cp })}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-cyan-400" /> Create Promotion Coupon
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MAKER20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Max Cap (₹, optional)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20"
                >
                  Save & Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Coupon Code?</h3>
                <p className="text-xs text-slate-400">Voucher will no longer be redeemable.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Delete voucher code <span className="font-mono font-bold text-cyan-400">{deleteModal.coupon?.code}</span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ open: false, coupon: null })}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20"
              >
                Delete Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
