'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  MapPin,
  ChevronLeft,
  Loader2,
  Phone,
  Mail,
  ShieldCheck,
  XCircle,
  Printer,
  FileText,
  RotateCcw,
  Check,
} from 'lucide-react';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isCodPlaced = searchParams.get('status') === 'cod_placed' || searchParams.get('success') === 'true';
  const isPaidSuccess = searchParams.get('status') === 'paid';

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState(null);

  // Invoice Modal
  const [showInvoice, setShowInvoice] = useState(false);

  // Replacement / Return Modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Dead On Arrival (DOA)');
  const [returnDetails, setReturnDetails] = useState('');
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!params.id) return;
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get(`/orders/${params.id}`);
        const fetched = res.data?.order || res.data;
        setOrder(fetched);
      } catch (err) {
        console.error('Failed to load order:', err);
        setError('Order not found or access denied.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [params.id]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      setIsCancelling(true);
      await api.put(`/orders/${order._id}/cancel`);
      alert('Order cancelled successfully.');
      const res = await api.get(`/orders/${order._id}`);
      setOrder(res.data?.order || res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    setReturnSubmitted(true);
    setTimeout(() => {
      setShowReturnModal(false);
      setReturnSubmitted(false);
      alert('Replacement request logged! An engineer will reach out within 24 hours to arrange pickup.');
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} />
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Loading shipment details...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm my-8">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Could not locate this order in your account history.
        </p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm"
          style={{ backgroundColor: BRAND.navy }}
        >
          View All Orders
        </Link>
      </div>
    );
  }

  const {
    _id,
    order_id,
    trackingNumber,
    orderItems = [],
    shippingAddress = {},
    paymentMethod = 'UPI',
    isPaid = false,
    orderStatus = 'Pending',
    totalPrice = 0,
    shippingPrice = 0,
    taxPrice = 0,
    createdAt,
  } = order;

  const status = String(orderStatus).toLowerCase();
  const isDelivered = status === 'delivered';
  const isShipped = status === 'shipped' || status === 'out_for_delivery' || isDelivered;
  const isCancelled = status === 'cancelled' || status === 'returned';

  const orderNum = trackingNumber || `ORD-${String(_id || order_id).slice(-8).toUpperCase()}`;

  const timelineSteps = [
    { title: 'Order Placed', time: isPaid ? 'Payment Verified' : 'Awaiting Payment', done: !isCancelled },
    { title: 'Packed & Anti-Static Sealed', time: 'ESD Safe Facility QC', done: isPaid && !isCancelled },
    { title: 'Dispatched via Courier', time: 'Delhivery / BlueDart AWB', done: isShipped && !isCancelled },
    { title: 'Delivered', time: isDelivered ? 'Delivered to Recipient' : 'Est. 2-4 Business Days', done: isDelivered },
  ];

  const orderDateFormatted = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent';

  // Subtotal calculation
  const calculatedItemsTotal = orderItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );
  const finalTotal = totalPrice || calculatedItemsTotal + (shippingPrice || 0);

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>

        {/* GST Invoice Button */}
        <button
          type="button"
          onClick={() => setShowInvoice(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-sky-600" />
          <span>GST Tax Invoice</span>
        </button>
      </div>

      {/* Confirmation Banner for newly placed order */}
      {(isCodPlaced || isPaidSuccess) && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold">
              {isPaidSuccess ? 'Payment Successful & Order Confirmed!' : 'Order Placed Successfully via COD!'}
            </h3>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Your components will be packed with anti-static ESD protection and dispatched shortly.
            </p>
          </div>
        </div>
      )}

      {/* 1. Status & Tracking Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Order Reference
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <Package className="w-4 h-4" style={{ color: BRAND.navy }} />
              <span className="text-base font-black text-slate-900 font-mono">
                {orderNum}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Placed on {orderDateFormatted}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isDelivered
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isCancelled
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : isShipped
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {orderStatus}
            </span>

            {isPaid ? (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100/70 text-emerald-800">
                PAID ({paymentMethod})
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100/70 text-amber-800">
                {paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'PAYMENT PENDING'}
              </span>
            )}
          </div>
        </div>

        {/* Visual Timeline Tracker */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-4">
            Courier Shipment Progress (India)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-2 relative">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                    step.done
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {step.done ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{step.title}</h4>
                  <p className="text-[10px] text-slate-400">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Ordered Items Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100">
          Ordered Hardware Components ({orderItems.length})
        </h3>
        <div className="divide-y divide-slate-100">
          {orderItems.map((item, idx) => {
            const img =
              item.image ||
              (item.images && item.images[0]) ||
              'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80';
            return (
              <div key={idx} className="py-3 flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 shrink-0 overflow-hidden">
                  <Image
                    src={img}
                    alt={item.title || 'Part'}
                    fill
                    sizes="56px"
                    className="object-contain p-1.5"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                    {item.title || item.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Quantity: {item.quantity || 1} • Unit Price: ₹{Number(item.price || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                  ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Price Breakdown Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-1 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Items Subtotal:</span>
            <span>₹{calculatedItemsTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Delivery Fee:</span>
            <span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
          </div>
          <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-slate-100">
            <span>Grand Total (Incl. 18% GST):</span>
            <span style={{ color: BRAND.navy }}>₹{finalTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 3. Shipping Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Delivery Destination
            </h3>
          </div>
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">{shippingAddress.fullName}</p>
            <p className="text-slate-500 font-mono">Mobile: {shippingAddress.phone}</p>
            <p className="text-slate-600 leading-relaxed pt-1">
              {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} -{' '}
              <strong className="font-mono">{shippingAddress.pincode}</strong>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Buyer Protection & Warranty
            </h3>
          </div>
          <div className="text-xs text-slate-600 space-y-1.5">
            <p>• 7-Day DOA Replacement Guarantee active.</p>
            <p>• Tested authentic microcontroller & sensor hardware.</p>
            <p>• In case of non-functional parts, submit a replacement claim below.</p>
          </div>
        </div>
      </div>

      {/* Action buttons (Cancel order / Replacement request / Support) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {!isShipped && !isCancelled && (
            <button
              type="button"
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors shadow-2xs"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}

          {isDelivered && (
            <button
              type="button"
              onClick={() => setShowReturnModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request 7-Day Replacement</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            <span>Support Helpline</span>
          </a>
          <a
            href={`mailto:support@techcrate.in?subject=Order%20${orderNum}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>Email Support</span>
          </a>
        </div>
      </div>

      {/* ================= Printable GST Tax Invoice Modal ================= */}
      {showInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Modal Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Official GST Tax Invoice Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs flex items-center gap-1.5"
                  style={{ backgroundColor: BRAND.navy }}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoice(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Invoice Container */}
            <div id="printable-invoice" className="space-y-6 text-xs text-slate-800">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight" style={{ color: BRAND.navy }}>
                    TECH CRATE
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Single-Vendor Online Electronics Store</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                    Pune Innovation Park, Shivaji Nagar<br />
                    Pune, Maharashtra 411001, India<br />
                    GSTIN: <strong>27AABCT1234F1Z5</strong> (State Code: 27)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900 uppercase block">TAX INVOICE</span>
                  <p className="text-slate-500 mt-1 font-mono">Invoice #: INV-{String(_id).slice(-8).toUpperCase()}</p>
                  <p className="text-slate-500 font-mono">Order #: {orderNum}</p>
                  <p className="text-slate-500">Date: {orderDateFormatted}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Billed / Shipped To:
                  </span>
                  <p className="font-bold text-slate-900">{shippingAddress.fullName}</p>
                  <p className="text-slate-600">{shippingAddress.street}</p>
                  <p className="text-slate-600">
                    {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                  </p>
                  <p className="text-slate-600 font-mono mt-0.5">Phone: {shippingAddress.phone}</p>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  <p><strong>Place of Supply:</strong> {shippingAddress.state || 'Maharashtra'}</p>
                  <p><strong>Payment Mode:</strong> {paymentMethod}</p>
                  <p><strong>Payment Status:</strong> {isPaid ? 'Paid' : 'Pending / COD'}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="p-2 border border-slate-200">Description</th>
                    <th className="p-2 border border-slate-200 text-center">HSN</th>
                    <th className="p-2 border border-slate-200 text-center">Qty</th>
                    <th className="p-2 border border-slate-200 text-right">Rate (₹)</th>
                    <th className="p-2 border border-slate-200 text-right">GST (18%)</th>
                    <th className="p-2 border border-slate-200 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, idx) => {
                    const lineTotal = Number(item.price || 0) * Number(item.quantity || 1);
                    const baseRate = Math.round(lineTotal / 1.18);
                    const gstAmount = lineTotal - baseRate;
                    return (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-200 font-medium">{item.title}</td>
                        <td className="p-2 border border-slate-200 text-center font-mono text-slate-500">8542</td>
                        <td className="p-2 border border-slate-200 text-center">{item.quantity || 1}</td>
                        <td className="p-2 border border-slate-200 text-right">₹{baseRate}</td>
                        <td className="p-2 border border-slate-200 text-right">₹{gstAmount}</td>
                        <td className="p-2 border border-slate-200 text-right font-bold">₹{lineTotal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Value:</span>
                    <span>₹{Math.round(calculatedItemsTotal / 1.18).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9%):</span>
                    <span>₹{Math.round((calculatedItemsTotal - Math.round(calculatedItemsTotal / 1.18)) / 2).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (9%):</span>
                    <span>₹{Math.round((calculatedItemsTotal - Math.round(calculatedItemsTotal / 1.18)) / 2).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping:</span>
                    <span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-300 pt-1.5">
                    <span>Invoice Total:</span>
                    <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Legal Footer Note */}
              <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 space-y-1">
                <p>This is a computer-generated tax invoice and does not require a physical signature.</p>
                <p>All goods sold are covered under TechCrate 7-Day Replacement Policy. For support, write to support@techcrate.in.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7-Day Replacement Modal ================= */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Submit 7-Day Replacement Claim</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Category:</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-brand-primary"
                >
                  <option value="Dead On Arrival (DOA)">Dead On Arrival (DOA) / Component won&apos;t boot</option>
                  <option value="Damaged in Transit">Physical damage during transit</option>
                  <option value="Missing Parts">Missing accessories or header pins</option>
                  <option value="Erratic Sensor Readings">Erratic / Incorrect sensor output</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Testing Notes & Voltage Used:</label>
                <textarea
                  required
                  rows={3}
                  value={returnDetails}
                  onChange={(e) => setReturnDetails(e.target.value)}
                  placeholder="e.g. Connected to 3.3V on ESP32, power LED is off, serial monitor shows no handshake..."
                  className="w-full p-2 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-brand-primary resize-none"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                As per policy, reverse pickup will be scheduled upon review and a replacement unit will be dispatched free of cost.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitted}
                  className="px-4 py-2 rounded-xl text-white font-bold"
                  style={{ backgroundColor: BRAND.navy }}
                >
                  {returnSubmitted ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
