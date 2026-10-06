import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, User, MapPin, CreditCard } from 'lucide-react';
import { orderService } from '../../services/orderService';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-sm text-cyan-400 font-semibold hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Order Details & Dispatch Timeline</h1>
        <p className="text-sm text-slate-400">Tracking #: <span className="font-mono text-cyan-400">{order?.trackingNumber || 'PK8472910'}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer & Address */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="font-bold text-white text-base flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" /> Customer Information
          </h2>
          <p className="text-sm text-white font-semibold">{order?.shippingAddress?.fullName || 'Rahul Sharma'}</p>
          <p className="text-xs text-slate-400"><MapPin className="w-3.5 h-3.5 inline mr-1" /> {order?.shippingAddress?.street || 'BITS Pilani Campus'}, {order?.shippingAddress?.city}</p>
        </div>

        {/* Payment Details */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="font-bold text-white text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Payment & Total
          </h2>
          <p className="text-sm text-slate-300">Method: <span className="text-white font-bold">{order?.paymentMethod || 'UPI'}</span></p>
          <p className="text-xl font-extrabold text-emerald-400">Total: ₹{order?.totalPrice || 2567}</p>
        </div>
      </div>
    </div>
  );
}
