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
    createdAt,
  } = order;

  const status = String(orderStatus).toLowerCase();
  const isDelivered = status === 'delivered';
  const isShipped = status === 'shipped' || status === 'out_for_delivery' || isDelivered;
  const isCancelled = status === 'cancelled' || status === 'returned';

  const timelineSteps = [
    { title: 'Order Placed', time: isPaid ? 'Payment Verified' : 'Awaiting Payment', done: !isCancelled },
    { title: 'Packed & Anti-Static Sealed', time: 'Warehouse Quality Check', done: isPaid && !isCancelled },
    { title: 'In Transit / Dispatched', time: 'Courier Partner Assigned', done: isShipped && !isCancelled },
    { title: 'Delivered', time: isDelivered ? 'Handed to Recipient' : 'Estimated 2-3 Business Days', done: isDelivered },
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

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to My Orders</span>
      </Link>

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
              Tracking Number
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <Package className="w-4 h-4" style={{ color: BRAND.navy }} />
              <span className="text-base font-black text-slate-900 font-mono">
                {trackingNumber || `ORD-${String(_id || order_id).slice(-8).toUpperCase()}`}
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
                PAID
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100/70 text-amber-800">
                PAYMENT PENDING
              </span>
            )}
          </div>
        </div>

        {/* Visual Timeline Tracker (Matches Mobile Timeline) */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-4">
            Shipment Status Progress
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
      </div>

      {/* 3. Shipping Address & Payment Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Delivery Address */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Delivery Address
            </h3>
          </div>
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">{shippingAddress.fullName}</p>
            <p className="text-slate-500">{shippingAddress.phone}</p>
            <p className="text-slate-600 leading-relaxed pt-1">
              {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} -{' '}
              {shippingAddress.pincode}
            </p>
          </div>
        </div>

        {/* Payment action removed from order details */}
        {false && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Payment
            </h3>
          </div>

          {!isPaid && paymentMethod === 'UPI' && !isCancelled && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              {/* Payment Instruction & Notice */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <QrCode className="w-4 h-4 text-amber-700" />
                  <span>Instant UPI Payment</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Scan the dynamic QR code below with any UPI application (Google Pay, PhonePe, Paytm, CRED, BHIM) to complete your order.
                </p>
                {isQuotaExceeded && (
                  <p className="text-[10px] text-amber-700/90 pt-1 font-medium">
                    (Auto UPI Gateway: Direct UPI mode active with zero transaction fees)
                  </p>
                )}
              </div>

              {/* Dynamic QR Code & UPI Details */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
                {paymentIntent?.qr_data ? (
                <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      paymentIntent.qr_data
                    )}&margin=1`}
                    alt="UPI Payment QR Code"
                    className="w-40 h-40 object-contain mx-auto"
                  />
                </div>) : (
                  <p className="text-xs text-slate-500">Click Pay Now to generate your order-specific payment details.</p>
                )}

                {paymentIntent && <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Official Merchant UPI ID
                  </span>
                  <div className="flex items-center gap-2 justify-center">
                    <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {paymentIntent.upi_id || 'UPI gateway payment'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      disabled={!paymentIntent?.upi_id}
                      className="p-1 rounded-md text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>}

                {/* Direct App Link Button */}
                {paymentIntent?.upi_intent_url && <a
                  href={paymentIntent.upi_intent_url}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                  style={{ backgroundColor: BRAND.primary }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in UPI App (GPay / PhonePe)</span>
                </a>}
                {!paymentIntent && <button
                  type="button"
                  onClick={handlePayNow}
                  disabled={isPaying}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-white text-xs font-bold disabled:opacity-50"
                  style={{ backgroundColor: BRAND.primary }}
                >
                  {isPaying ? 'Preparing payment...' : 'Pay Now'}
                </button>}
              </div>

              {/* Status Verification */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCheckStatus}
                  disabled={isVerifying}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking Status...</span>
                    </>
                  ) : (
                    <span>I Have Paid — Verify Status</span>
                  )}
                </button>

                {verificationMsg && (
                  <p className="text-[11px] text-center font-medium text-slate-600 px-2 py-1 bg-slate-100 rounded-md">
                    {verificationMsg}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Action buttons (Cancel order / Support) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
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

        <div className="flex items-center gap-2 ml-auto">
          <a
            href="tel:+918005553420"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            <span>Support Helpline</span>
          </a>
          <a
            href={`mailto:support@TechCrate.com?subject=Order%20${trackingNumber || _id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>Email Tech Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
