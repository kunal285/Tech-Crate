import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  User,
  MapPin,
  CreditCard,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error('[Load Order Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.put(`/orders/${id}/status`, { orderStatus: newStatus });
      setOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : prev));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl space-y-6">
        <div className="h-6 w-32 bg-slate-800 rounded animate-pulse"></div>
        <div className="h-10 w-72 bg-slate-800 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-slate-800 rounded-2xl animate-pulse"></div>
          <div className="h-48 bg-slate-800 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Order Not Found</h2>
        <p className="text-sm text-slate-400">The requested order ID does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm hover:bg-slate-700"
        >
          Return to Orders
        </button>
      </div>
    );
  }

  const items = order.orderItems || [];
  const trackingNumber = order.trackingNumber || order._id;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-sm text-cyan-400 font-semibold hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      {/* Header with Tracking ID and Status Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">Order #{trackingNumber.slice(-8).toUpperCase()}</h1>
            <button
              onClick={() => handleCopy(trackingNumber)}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Copy Tracking ID"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Fulfillment Status:</span>
          <select
            disabled={updatingStatus}
            value={order.orderStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-semibold text-cyan-400 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            {['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
              <option key={st} value={st} className="bg-slate-950 text-slate-200">
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer & Shipping Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer & Delivery Address */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-white text-base flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" /> Customer & Delivery Address
          </h2>
          <div className="space-y-1.5 text-sm">
            <p className="text-white font-semibold">{order.shippingAddress?.fullName || order.user?.name || 'Customer'}</p>
            <p className="text-slate-400">{order.shippingAddress?.phone || order.user?.phone || 'No phone provided'}</p>
            <div className="text-slate-300 pt-2 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                {order.shippingAddress?.street || order.shippingAddress?.addressLine1 || 'Campus / Street Address'},{' '}
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode || order.shippingAddress?.pinCode}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-white text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Payment & Billing Overview
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Payment Gateway:</span>
              <span className="font-semibold text-white">{order.paymentMethod || 'UPI / Card'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payment Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  order.isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}
              >
                {order.isPaid ? 'PAID & VERIFIED' : 'PAYMENT PENDING'}
              </span>
            </div>
            {order.paidAt && (
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Paid Timestamp:</span>
                <span className="text-slate-300">{new Date(order.paidAt).toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-slate-800/80 pt-2 flex justify-between items-center">
              <span className="text-white font-semibold">Total Amount Charged:</span>
              <span className="text-xl font-extrabold text-emerald-400">
                ₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Order Products Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="font-bold text-white text-base flex items-center gap-2">
          <Package className="w-4 h-4 text-cyan-400" /> Package Contents ({items.length} items)
        </h2>

        <div className="divide-y divide-slate-800/60">
          {items.map((item, index) => {
            const product = item.product || {};
            const title = item.name || item.title || product.title || 'Electronics Component';
            const price = item.price || product.price || 0;
            const qty = item.quantity || 1;
            const image =
              item.image ||
              (product.images && product.images[0]) ||
              'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=150&q=80';

            return (
              <div key={index} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={image}
                    alt={title}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-800 flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-semibold text-white text-sm">{title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ₹{price.toLocaleString('en-IN')} × {qty} units
                    </p>
                  </div>
                </div>
                <div className="font-bold text-white text-sm">
                  ₹{(price * qty).toLocaleString('en-IN')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
