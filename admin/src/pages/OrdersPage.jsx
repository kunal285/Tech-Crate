import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  Eye,
  Search,
  Filter,
  RefreshCw,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';
import api from '../services/api';

const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Processing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;
    const delivered = orders.filter((o) => o.orderStatus === 'Delivered').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    return { total, pending, delivered, totalRevenue };
  }, [orders]);

  // Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Order Fulfillment & Tracking</h1>
          <p className="text-sm text-slate-400">Monitor student and maker component orders, dispatch status, and payments</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Orders
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Orders</span>
          <div className="text-2xl font-bold text-white mt-1">{metrics.total}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-amber-400 font-semibold uppercase">Pending Dispatch</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{metrics.pending}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-emerald-400 font-semibold uppercase">Delivered Orders</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.delivered}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-cyan-400 font-semibold uppercase">Gross Value</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">₹{metrics.totalRevenue.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Tracking ID, Customer Name, or City..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Status Tab Filters */}
        <div className="flex items-center overflow-x-auto gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                statusFilter === st ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                <th className="p-4">Tracking ID</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Items / Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="w-24 h-4 bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="w-32 h-4 bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="w-20 h-4 bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="w-20 h-4 bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="w-24 h-4 bg-slate-800 rounded"></div></td>
                    <td className="p-4"><div className="w-16 h-4 bg-slate-800 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-white">No orders matching filter</h3>
                      <p className="text-xs text-slate-400 mt-1">Try selecting a different status filter or clearing search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const itemCount =
                    order.orderItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 1;

                  return (
                    <tr key={order._id} className="hover:bg-slate-900/50 transition-all">
                      {/* Tracking ID */}
                      <td className="p-4 font-mono font-semibold">
                        <span className="text-cyan-400">{order.trackingNumber || order._id?.slice(-8).toUpperCase()}</span>
                        <div className="text-[11px] text-slate-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="p-4">
                        <div className="font-semibold text-white">
                          {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">
                          {order.shippingAddress?.city}, {order.shippingAddress?.state || 'India'}
                        </div>
                      </td>

                      {/* Items / Total Price */}
                      <td className="p-4">
                        <div className="font-bold text-emerald-400">₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}</div>
                        <div className="text-xs text-slate-400">{itemCount} items</div>
                      </td>

                      {/* Payment */}
                      <td className="p-4 text-xs font-semibold">
                        <span
                          className={`px-2.5 py-1 rounded-full border ${
                            order.isPaid
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {order.paymentMethod || 'UPI'} • {order.isPaid ? 'PAID' : 'PENDING'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <select
                          disabled={updatingId === order._id}
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          className={`bg-slate-900 border text-xs font-semibold rounded-lg p-2 focus:outline-none ${getStatusBadge(
                            order.orderStatus
                          )}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-slate-950 text-slate-200">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-cyan-400 hover:bg-slate-700 transition-all text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
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
          <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredOrders.length)} -{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-white px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
