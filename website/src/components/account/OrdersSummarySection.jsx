'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, ExternalLink, Clock, Truck, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { ORDER_STATUS } from '@/lib/constants';
import { BRAND } from '@/theme/tokens';

export default function OrdersSummarySection() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      try {
        setIsLoading(true);
        const res = await api.get('/orders/myorders');
        if (isMounted) {
          const raw = Array.isArray(res.data) ? res.data : res.data?.orders || [];
          setOrders(raw);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load orders.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm flex flex-col items-center justify-center min-h-[220px] space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-xs font-semibold text-slate-500">
          Loading hardware order history...
        </span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
          <Package className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-slate-900">No Orders Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You haven&apos;t placed any component or project kit orders yet. Explore our catalog of microcontrollers, sensors, and robotics parts.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-sm active:scale-98 transition-all"
            style={{ backgroundColor: BRAND.navy }}
          >
            <span>Explore Components</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Hardware Orders ({orders.length})
          </h2>
          <p className="text-xs text-slate-500">
            Real-time fulfillment, tracking and invoice downloads.
          </p>
        </div>
        <Link
          href="/orders"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {orders.slice(0, 5).map((order) => {
          const statusKey = (order.orderStatus || order.status || 'placed').toLowerCase();
          const statusInfo = ORDER_STATUS[statusKey] || {
            label: order.orderStatus || 'Processing',
            color: 'blue',
          };

          const orderDate = order.createdAt
            ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'Recent';

          const itemsCount =
            order.orderItems?.reduce((sum, i) => sum + (i.quantity || 1), 0) ||
            order.items?.length ||
            1;

          const totalAmount = order.totalAmount || order.totalPrice || order.amount || 0;

          return (
            <div
              key={order._id || order.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    #{String(order._id || order.id).slice(-8).toUpperCase()}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{orderDate}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <Truck className="w-3 h-3 text-blue-600" />
                    <span>{statusInfo.label}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-700">
                    {order.orderItems?.[0]?.name ||
                      order.items?.[0]?.title ||
                      `${itemsCount} Hardware Components`}
                    {itemsCount > 1 && (
                      <span className="text-slate-400 font-normal"> + {itemsCount - 1} more items</span>
                    )}
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-900">
                    Total: ₹{totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>

                <Link
                  href={`/orders/${order._id || order.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <span>Track & Invoice</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
