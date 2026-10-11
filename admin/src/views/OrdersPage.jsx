'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  Eye,
  Search,
  RefreshCw,
  Printer,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';
import EmptyState from '@/components/ui/EmptyState';
import api from '../services/api';

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = [
  'Pending',
  'Processing',
  'Confirmed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Courier Assignment Modal State
  const [courierModal, setCourierModal] = useState({
    open: false,
    order: null,
    partner: 'Delhivery',
    trackingNumber: '',
    saving: false,
  });

  // Print Invoice Modal State
  const [invoiceModal, setInvoiceModal] = useState({
    open: false,
    order: null,
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[Fetch Orders Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveCourier = async () => {
    if (!courierModal.order) return;
    setCourierModal((prev) => ({ ...prev, saving: true }));
    try {
      // Update courier metadata alongside status transition if applicable
      await api.put(`/orders/${courierModal.order._id}/status`, {
        orderStatus: 'Shipped',
        courierPartner: courierModal.partner,
        trackingNumber: courierModal.trackingNumber,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o._id === courierModal.order._id
            ? {
                ...o,
                orderStatus: 'Shipped',
                courierPartner: courierModal.partner,
                trackingNumber: courierModal.trackingNumber,
              }
            : o
        )
      );
      setCourierModal({ open: false, order: null, partner: 'Delhivery', trackingNumber: '', saving: false });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign tracking information');
      setCourierModal((prev) => ({ ...prev, saving: false }));
    }
  };

  // Status Counts for Tabs
  const statusCounts = useMemo(() => {
    const counts = { All: orders.length };
    orders.forEach((o) => {
      const st = o.orderStatus || 'Pending';
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (o.order_id || o._id)?.toLowerCase().includes(q) ||
        (o.trackingNumber || '')?.toLowerCase().includes(q) ||
        (o.shippingAddress?.fullName || o.user?.name || '')?.toLowerCase().includes(q) ||
        (o.shippingAddress?.city || '')?.toLowerCase().includes(q) ||
        (o.shippingAddress?.phone || '')?.includes(q);

      const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const getTrackingUrl = (partner, tracking) => {
    if (!tracking) return '#';
    switch (partner) {
      case 'Delhivery':
        return `https://www.delhivery.com/track/package/${tracking}`;
      case 'Shiprocket':
        return `https://shiprocket.co/tracking/${tracking}`;
      case 'BlueDart':
        return `https://www.bluedart.com/tracking?numbers=${tracking}`;
      default:
        return `https://www.google.com/search?q=${encodeURIComponent(`${partner} tracking ${tracking}`)}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Orders & Dispatch Center"
        subtitle="Manage customer shipments, track courier dispatches, and issue tax invoices"
        icon={ShoppingCart}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh Orders
          </Button>
        }
      />

      {/* Pipeline Status Filter Tabs */}
      <Tabs
        tabs={[
          { id: 'All', label: 'All Orders', count: statusCounts.All || 0 },
          { id: 'Pending', label: 'Pending', count: statusCounts.Pending || 0 },
          { id: 'Processing', label: 'Processing', count: statusCounts.Processing || 0 },
          { id: 'Confirmed', label: 'Confirmed', count: statusCounts.Confirmed || 0 },
          { id: 'Shipped', label: 'Shipped', count: statusCounts.Shipped || 0 },
          { id: 'Delivered', label: 'Delivered', count: statusCounts.Delivered || 0 },
          { id: 'Cancelled', label: 'Cancelled', count: statusCounts.Cancelled || 0 },
        ]}
        activeTab={statusFilter}
        onChange={(tab) => {
          setStatusFilter(tab);
          setCurrentPage(1);
        }}
      />

      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0F172A] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Tracking ID, Customer Name, Phone, or City..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus-ring"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 self-center px-1">
          Showing {filteredOrders.length} filtered orders
        </span>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                <th className="p-3.5 sm:p-4">Order / AWB</th>
                <th className="p-3.5 sm:p-4">Customer Details</th>
                <th className="p-3.5 sm:p-4">Items / Total</th>
                <th className="p-3.5 sm:p-4">Payment</th>
                <th className="p-3.5 sm:p-4">Pipeline Status</th>
                <th className="p-3.5 sm:p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="p-4">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState
                      title="No orders found"
                      description="No orders currently match your filter criteria or search keyword."
                    />
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const itemCount = (order.orderItems || []).reduce((acc, i) => acc + (i.qty || i.quantity || 1), 0);
                  const isPaid = order.isPaid;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors"
                    >
                      {/* Order & Tracking ID */}
                      <td className="p-3.5 sm:p-4">
                        <div className="font-mono text-xs font-bold text-[#032762] dark:text-blue-400">
                          {order.order_id || String(order._id).slice(-8).toUpperCase()}
                        </div>
                        {order.trackingNumber ? (
                          <a
                            href={getTrackingUrl(order.courierPartner, order.trackingNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-primary hover:underline mt-0.5"
                          >
                            <span>{order.courierPartner || 'Delhivery'}: {order.trackingNumber}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setCourierModal({
                                open: true,
                                order,
                                partner: 'Delhivery',
                                trackingNumber: '',
                                saving: false,
                              })
                            }
                            className="text-[11px] font-semibold text-brand-orange hover:underline mt-0.5 inline-flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Assign Courier</span>
                          </button>
                        )}
                      </td>

                      {/* Customer Details */}
                      <td className="p-3.5 sm:p-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {order.shippingAddress?.city || 'City'}, {order.shippingAddress?.state || 'India'}
                        </div>
                      </td>

                      {/* Items / Total Price */}
                      <td className="p-3.5 sm:p-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          ₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {itemCount} component{itemCount !== 1 ? 's' : ''}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="p-3.5 sm:p-4">
                        <StatusBadge
                          status={isPaid ? 'Paid' : 'Pending'}
                          size="sm"
                        />
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
                          {order.paymentMethod || 'UPI'}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-3.5 sm:p-4">
                        <select
                          disabled={updatingId === order._id}
                          value={order.orderStatus || 'Pending'}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus-ring cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 sm:p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInvoiceModal({ open: true, order })}
                            title="Generate GST Tax Invoice"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-primary hover:border-brand-primary transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => router.push(`/orders/${order._id}`)}
                            icon={Eye}
                          >
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0F172A]">
            <div>
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredOrders.length)} -{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-900 dark:text-slate-100 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Courier Assignment Modal */}
      <Modal
        open={courierModal.open}
        onClose={() => setCourierModal((prev) => ({ ...prev, open: false }))}
        title="Assign Courier Partner & AWB"
        description="Attach dispatch logistics and generate tracking link for customer"
      >
        <div className="space-y-4 pt-1">
          <Select
            label="Logistics Partner"
            value={courierModal.partner}
            onChange={(e) => setCourierModal((prev) => ({ ...prev, partner: e.target.value }))}
            options={['Delhivery', 'Shiprocket', 'BlueDart', 'DTDC', 'India Post']}
          />

          <Input
            label="AWB Tracking Number"
            placeholder="e.g. 142093847291"
            value={courierModal.trackingNumber}
            onChange={(e) => setCourierModal((prev) => ({ ...prev, trackingNumber: e.target.value }))}
            helperText="Customer will receive automated tracking status via SMS/Email"
          />

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              onClick={() => setCourierModal((prev) => ({ ...prev, open: false }))}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={courierModal.saving}
              disabled={!courierModal.trackingNumber.trim()}
              onClick={handleSaveCourier}
              icon={Truck}
            >
              Confirm Dispatch
            </Button>
          </div>
        </div>
      </Modal>

      {/* Print-Friendly GST Tax Invoice Modal */}
      <Modal
        open={invoiceModal.open}
        onClose={() => setInvoiceModal({ open: false, order: null })}
        title="Tax Invoice / Bill of Supply"
        description="Print-friendly statutory invoice with HSN 8542 & GST breakdown"
        size="lg"
      >
        {invoiceModal.order && (
          <div className="space-y-6 pt-2 text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
            {/* Invoice Printable Sheet */}
            <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#032762] dark:text-blue-400">Tech Crate Hardware Pvt Ltd</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Electronic Components & DIY Robotics</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">GSTIN: 27AABCT8542H1Z5 • State: Maharashtra (27)</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-blue-50 text-brand-primary dark:bg-blue-950 dark:text-blue-300 font-bold text-xs uppercase">
                    ORIGINAL FOR RECIPIENT
                  </span>
                  <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mt-2">
                    Invoice: INV-TC-{String(invoiceModal.order._id).slice(-6).toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-500">
                    Date: {new Date(invoiceModal.order.createdAt || Date.now()).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Billed To / Shipped To */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider">Billed & Shipped To:</span>
                  <p className="font-semibold mt-1">{invoiceModal.order.shippingAddress?.fullName || 'Customer'}</p>
                  <p className="text-slate-500">{invoiceModal.order.shippingAddress?.street}</p>
                  <p className="text-slate-500">
                    {invoiceModal.order.shippingAddress?.city}, {invoiceModal.order.shippingAddress?.state} - {invoiceModal.order.shippingAddress?.pincode}
                  </p>
                  <p className="text-slate-500">Phone: {invoiceModal.order.shippingAddress?.phone || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-500 uppercase tracking-wider">Payment Details:</span>
                  <p className="font-semibold mt-1">Method: {invoiceModal.order.paymentMethod || 'UPI'}</p>
                  <p className="text-slate-500">Status: {invoiceModal.order.isPaid ? 'PAID' : 'PENDING'}</p>
                  <p className="text-slate-500">Transaction ID: {invoiceModal.order.paymentResult?.id || 'TXN-DIRECT'}</p>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-400">
                    <th className="p-2">Item Description</th>
                    <th className="p-2">HSN</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(invoiceModal.order.orderItems || []).map((item, idx) => {
                    const price = item.price || 0;
                    const qty = item.qty || item.quantity || 1;
                    return (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{item.title || item.name || 'Component'}</td>
                        <td className="p-2 font-mono text-slate-500">8542</td>
                        <td className="p-2 text-center tabular-nums">{qty}</td>
                        <td className="p-2 text-right tabular-nums">₹{price.toLocaleString('en-IN')}</td>
                        <td className="p-2 text-right font-semibold tabular-nums">₹{(price * qty).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Taxable Value:</span>
                    <span className="tabular-nums">₹{Math.round(invoiceModal.order.totalPrice * 0.8475).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>GST (18% GSTIN):</span>
                    <span className="tabular-nums">₹{Math.round(invoiceModal.order.totalPrice * 0.1525).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span>Grand Total:</span>
                    <span className="tabular-nums">₹{Number(invoiceModal.order.totalPrice).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <Button
                variant="outline"
                onClick={() => setInvoiceModal({ open: false, order: null })}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => window.print()}
                icon={Printer}
              >
                Print Tax Invoice
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
