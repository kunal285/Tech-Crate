'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronRight,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

export default function OrdersHistoryPage() {
  const { isAuthenticated, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) return;
      try {
        setIsLoading(true);
        const res = await api.get('/orders/myorders');
        const list = Array.isArray(res.data) ? res.data : res.data?.orders || [];
        setOrders(list);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (!loading) {
      fetchOrders();
    }
  }, [isAuthenticated, loading]);

  const getStatusBadge = (status = '') => {
    const s = String(status).toLowerCase();
    if (s === 'delivered') {
      return { bg: '#ECFDF5', text: '#059669', icon: CheckCircle, label: 'Delivered' };
    }
    if (s === 'shipped' || s === 'out_for_delivery') {
      return { bg: '#EFF6FF', text: '#2563EB', icon: Truck, label: 'Shipped' };
    }
    if (s === 'cancelled' || s === 'returned') {
      return { bg: '#FEF2F2', text: '#DC2626', icon: XCircle, label: 'Cancelled' };
    }
    return { bg: '#FEF3C7', text: '#D97706', icon: Clock, label: status || 'Processing' };
  };

  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} />
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Loading your hardware orders...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm my-8">
        <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Sign in to view orders</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Log in with your email or mobile phone to track your component dispatches.
        </p>
        <Link
          href="/account/login?redirect=/orders"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm"
          style={{ backgroundColor: BRAND.navy }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div className="pb-3 border-b border-slate-200">
        <h1
          className="text-2xl sm:text-3xl font-black tracking-tight"
          style={{ color: BRAND.navy }}
        >
          My Orders & Shipments
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track packages, check payment statuses, and review your purchased hardware components.
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-3.5">
          {orders.map((order) => {
            const badge = getStatusBadge(order.orderStatus);
            const StatusIcon = badge.icon;
            const itemsCount = order.orderItems?.length || 1;
            const formattedDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recent Order';

            return (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="block p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm transition-all group"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" style={{ color: BRAND.navy }} />
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {order.trackingNumber || `ORD-${String(order._id).slice(-8).toUpperCase()}`}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Placed on {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold"
                      style={{ backgroundColor: badge.bg, color: badge.text }}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </div>

                    {order.isPaid ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        PAID
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>

                {/* Items Preview */}
                <div className="py-3 space-y-1 text-xs text-slate-600">
                  {order.orderItems?.slice(0, 2).map((prod, idx) => (
                    <p key={idx} className="line-clamp-1">
                      • {prod.title || prod.name || 'Component'} (x{prod.quantity || 1})
                    </p>
                  ))}
                  {itemsCount > 2 && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      + {itemsCount - 2} more {itemsCount - 2 === 1 ? 'item' : 'items'}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Grand Total
                    </span>
                    <span
                      className="text-base font-extrabold"
                      style={{ color: BRAND.navy }}
                    >
                      ₹{Number(order.totalPrice || order.itemsPrice || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-brand-primary group-hover:translate-x-0.5 transition-transform">
                    <span>Track Order</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm max-w-md mx-auto">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">No orders found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            You haven&apos;t placed any electronic component or kit orders yet.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm"
            style={{ backgroundColor: BRAND.navy }}
          >
            <span>Explore Electronics Store</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
