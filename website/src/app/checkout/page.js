'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  Loader2,
  AlertCircle,
  MapPin,
  Check,
  Banknote,
  QrCode,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, discountAmount, deliveryFee, taxAmount, totalAmount, coupon, clearCart } =
    useCart();
  const { user, isAuthenticated } = useAuth();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'COD'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const paymentOptions = [
    {
      id: 'UPI',
      title: 'UPI',
      description: 'Google Pay, PhonePe, Paytm and other UPI apps',
      icon: QrCode,
    },
    {
      id: 'COD',
      title: 'Cash on Delivery',
      description: 'Pay when your order is delivered',
      icon: Banknote,
    },
  ];

  // Pre-fill user profile info if logged in
  useEffect(() => {
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
        street: prev.street || user.address?.street || '',
        city: prev.city || user.address?.city || '',
        state: prev.state || user.address?.state || '',
        pincode: prev.pincode || user.address?.pincode || '',
      }));
    }
  }, [user]);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm my-8">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Please add components to your cart before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm"
          style={{ backgroundColor: BRAND.navy }}
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      router.push('/account/login?redirect=/checkout');
      return;
    }

    // Validate address fields
    if (
      !shippingAddress.fullName.trim() ||
      !shippingAddress.phone.trim() ||
      !shippingAddress.street.trim() ||
      !shippingAddress.city.trim() ||
      !shippingAddress.state.trim() ||
      !shippingAddress.pincode.trim()
    ) {
      setError('Please provide all required shipping address fields accurately.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Format order items for server-authoritative creation
      const orderItems = cartItems.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        image: item.image || (item.images && item.images[0]) || '',
        product: item.itemType === 'kit' ? undefined : item._id,
        projectKit: item.itemType === 'kit' ? item.projectKit || item._id : undefined,
        itemType: item.itemType || 'product',
      }));

      // 2. Initialize checkout session
      const checkoutPayload = {
        orderItems,
        shippingAddress,
        paymentMethod,
        couponCode: coupon?.code || undefined,
        // The backend will handle appending necessary query params or we can use the AutoUPI redirect params
        redirect_url: `${window.location.origin}/payment/success`,
        failure_url: `${window.location.origin}/payment/failed`,
      };

      const res = await api.post('/checkout/initiate', checkoutPayload);
      const sessionData = res.data;

      if (!sessionData?.success) {
        throw new Error(sessionData?.message || 'Failed to initialize checkout.');
      }

      if (paymentMethod === 'UPI') {
        const gatewayUrl = sessionData.payment_url || sessionData.upi_intent_url;
        if (!gatewayUrl) {
          throw new Error('Unable to get payment gateway URL.');
        }
        window.location.href = gatewayUrl;
        return;
      }

      // Cash on delivery
      clearCart();
      router.push(`/orders/${sessionData.session_id}?success=true`);
    } catch (err) {
      console.warn('[Checkout Note]:', err?.response?.data?.message || err?.message);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to process order. Please check address details and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Heading */}
      <div className="pb-3 border-b border-slate-200">
        <h1
          className="text-2xl sm:text-3xl font-black tracking-tight"
          style={{ color: BRAND.navy }}
        >
          Checkout & Payment
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter your delivery destination and select your verified payment method.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        {[
          ['1', 'Delivery address', true],
          ['2', 'Payment', true],
          ['3', 'Confirmation', false],
        ].map(([step, title, active]) => (
          <div
            key={step}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
              active ? 'bg-sky-50 text-sky-800' : 'text-slate-400'
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                active ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step}
            </span>
            <span className="hidden text-[11px] font-bold uppercase tracking-wide sm:block">
              {title}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Delivery Address & Payment Method (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Delivery Address Card (Matches Mobile Delivery Address Card) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 p-5 pb-3">
              <MapPin className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Delivery Address
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Mobile Number (for updates) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength={10}
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Street / Campus / Hostel Address *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  placeholder="e.g. Hostel 12, Room 402, Campus Block"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Pune"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  maxLength={6}
                  value={shippingAddress.pincode}
                  onChange={handleInputChange}
                  placeholder="e.g. 411001"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method Card (Matches Mobile Payment Selector) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Payment Method
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row">
              <div className="w-full border-b border-slate-100 bg-slate-50 sm:w-2/5 sm:border-b-0 sm:border-r">
                {paymentOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = paymentMethod === option.id;
                  return (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => setPaymentMethod(option.id)}
                      className={`flex w-full items-center gap-3 border-l-4 px-4 py-4 text-left transition ${
                        selected
                          ? 'border-sky-600 bg-white text-sky-800'
                          : 'border-transparent text-slate-700 hover:bg-white'
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>
                        <span className="block text-xs font-extrabold">{option.title}</span>
                        <span className="mt-0.5 block text-[10px] text-slate-500">
                          {option.description}
                        </span>
                      </span>
                      {selected && <Check className="ml-auto h-4 w-4 shrink-0 text-sky-600" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex-1 p-5">
                {paymentMethod === 'UPI' ? (
                  <>
                    <p className="text-sm font-extrabold text-slate-900">Pay securely with UPI</p>
                    <p className="mt-1 text-xs text-slate-500">
                      You will be redirected to the secure Auto UPI gateway after placing the order.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                        <span
                          key={app}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-extrabold text-slate-900">Cash on Delivery</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Pay the delivery partner in cash when your TechCrate order arrives.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 3. Delivery & Guarantee Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              All shipments are bubble-wrapped with anti-static ESD packaging and tracked dispatch.
            </p>
          </div>
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-6 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100">
              Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </h3>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 py-1">
                  <div className="flex-1 truncate">
                    <span className="font-semibold text-slate-800">{item.title}</span>
                    <span className="text-slate-400 text-[11px] block">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ₹{Number(subtotal).toLocaleString('en-IN')}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{Number(discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>Estimated GST (18%)</span>
                <span className="font-semibold text-slate-900">
                  ₹{Number(taxAmount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Delivery</span>
                <span className="font-semibold">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Total Payable</span>
              <span
                className="text-xl font-black"
                style={{ color: BRAND.navy }}
              >
                ₹{Number(totalAmount).toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#032762] hover:bg-[#034697] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: BRAND.navy }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order & Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
