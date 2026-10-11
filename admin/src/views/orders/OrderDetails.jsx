'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Printer,
  ChevronRight,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import api from '../../services/api';

const PIPELINE_STEPS = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function OrderDetails() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
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
      <div className="space-y-6 max-w-5xl animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
          <div className="h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The requested order ID does not exist or has been removed from the platform.
        </p>
        <Button onClick={() => router.push('/orders')} variant="primary" icon={ArrowLeft}>
          Return to Orders
        </Button>
      </div>
    );
  }

  const items = order.orderItems || [];
  const orderNumber = order.order_id || String(order._id).slice(-8).toUpperCase();
  const currentStepIdx = PIPELINE_STEPS.indexOf(order.orderStatus || 'Placed');

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <PageHeader
        title={`Order #${orderNumber}`}
        subtitle={`Placed on ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}`}
        breadcrumbs={[
          { label: 'Orders', href: '/orders' },
          { label: `#${orderNumber}` },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              icon={Printer}
            >
              Print Invoice
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/orders')}
              icon={ArrowLeft}
            >
              Back to Queue
            </Button>
          </div>
        }
      />

      {/* Fulfillment Status Pipeline Steps (Mirrors Storefront Tracker) */}
      <Card className="p-6">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-5">
          Order Fulfillment Pipeline
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
          {PIPELINE_STEPS.map((step, idx) => {
            const isCompleted = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;

            return (
              <div key={step} className="flex sm:flex-col items-center gap-3 sm:gap-2 relative z-10 w-full sm:w-auto">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                    isCompleted
                      ? 'bg-brand-primary text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="text-left sm:text-center">
                  <p className={`text-xs font-semibold ${isCurrent ? 'text-brand-primary dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                    {step}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider block">
                      Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer & Shipping Details */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <User className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Customer & Delivery Address</h3>
          </div>

          <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-white">
              {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
            </p>
            <p className="text-slate-500">{order.shippingAddress?.street}</p>
            <p className="text-slate-500">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
            <p className="text-slate-500">Phone: {order.shippingAddress?.phone || 'N/A'}</p>
            <p className="text-slate-500">Email: {order.user?.email || 'N/A'}</p>
          </div>

          {order.trackingNumber && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs space-y-1">
              <span className="font-semibold text-brand-primary">Logistics Partner:</span>
              <p className="font-mono">{order.courierPartner || 'Delhivery'}: {order.trackingNumber}</p>
            </div>
          )}
        </Card>

        {/* Payment & Invoice Breakdown */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <CreditCard className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Payment Breakdown</h3>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Payment Channel:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{order.paymentMethod || 'UPI'}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Settlement Status:</span>
              <StatusBadge status={order.isPaid ? 'Paid' : 'Pending'} size="sm" />
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Taxable Subtotal:</span>
              <span className="tabular-nums">₹{Math.round(order.totalPrice * 0.8475).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>GST (HSN 8542 18%):</span>
              <span className="tabular-nums">₹{Math.round(order.totalPrice * 0.1525).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base font-extrabold text-[#032762] dark:text-blue-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Total Realized (INR):</span>
              <span className="tabular-nums">₹{Number(order.totalPrice).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Ordered Components List */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Package className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Order Items ({items.length})</h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item, idx) => {
            const qty = item.qty || item.quantity || 1;
            const price = item.price || 0;

            return (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {item.title || item.name || 'Component'}
                  </p>
                  <p className="text-slate-400 text-xs">HSN: 8542 • Qty: {qty}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white tabular-nums">
                    ₹{(price * qty).toLocaleString('en-IN')}
                  </p>
                  <p className="text-slate-400 text-[11px] tabular-nums">₹{price} each</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
