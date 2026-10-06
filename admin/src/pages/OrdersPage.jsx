import React, { useEffect, useState } from 'react';
import { ShoppingCart, Truck, CheckCircle2, Clock, MapPin, Eye } from 'lucide-react';
import adminApi from '../services/adminApi';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await adminApi.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.message);
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
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Order Fulfillment & Tracking</h1>
        <p className="text-sm text-slate-400">Monitor customer component orders, shipping status & payments</p>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
              <th className="p-4">Tracking ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items Count</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Update Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-slate-900/50 transition-all">
                <td className="p-4 font-mono text-cyan-400 font-semibold">{order.trackingNumber || 'PK8472910'}</td>
                <td className="p-4">
                  <div className="font-semibold text-white">{order.shippingAddress?.fullName || 'Customer'}</div>
                  <div className="text-xs text-slate-400">{order.shippingAddress?.city}, {order.shippingAddress?.state}</div>
                </td>
                <td className="p-4 text-slate-300">{order.orderItems?.length || 1} items</td>
                <td className="p-4 font-bold text-emerald-400">₹{order.totalPrice}</td>
                <td className="p-4 text-xs font-semibold">
                  <span className={`px-2.5 py-1 rounded-full ${order.isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {order.paymentMethod} • {order.isPaid ? 'PAID' : 'PENDING'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
