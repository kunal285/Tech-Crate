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
  User,
  Info,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi NCR',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Jammu & Kashmir',
  'Chandigarh',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, discountAmount, deliveryFee, taxAmount, totalAmount, coupon, clearCart } =
    useCart();
  const { user, isAuthenticated } = useAuth();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // 'Razorpay' | 'COD'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const paymentOptions = [
    {
      id: 'Razorpay',
      title: 'UPI, Cards & NetBanking (Razorpay)',
      description: 'Instant UPI (Google Pay, PhonePe, Paytm), RuPay / Debit / Credit Cards & NetBanking',
      icon: CreditCard,
    },
    {
      id: 'COD',
      title: 'Cash on Delivery (COD)',
      description: 'Pay cash to delivery partner when your TechCrate parcel arrives',
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
        email: prev.email || user.email || '',
        street: prev.street || user.address?.street || '',
        city: prev.city || user.address?.city || '',
        state: prev.state || user.address?.state || 'Maharashtra',
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
          Please add hardware components to your cart before proceeding to checkout.
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

    // Validate address fields (10 digit phone, 6 digit pincode)
    const cleanPhone = shippingAddress.phone.replace(/\D/g, '');
    const cleanPincode = shippingAddress.pincode.replace(/\D/g, '');

    if (
      !shippingAddress.fullName.trim() ||
      cleanPhone.length !== 10 ||
      !shippingAddress.street.trim() ||
      !shippingAddress.city.trim() ||
      !shippingAddress.state.trim() ||
      cleanPincode.length !== 6
    ) {
      setError('Please provide a valid full name, 10-digit mobile number, street, city, state, and 6-digit Indian PIN code.');
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

      // 2. Initialize checkout session (atomically reserves inventory)
      const checkoutPayload = {
        orderItems,
        shippingAddress: {
          ...shippingAddress,
          phone: cleanPhone,
          pincode: cleanPincode,
        },
        paymentMethod,
        couponCode: coupon?.code || undefined,
        redirect_url: `${window.location.origin}/payment/success`,
        failure_url: `${window.location.origin}/payment/failed`,
      };

      const res = await api.post('/checkout/initiate', checkoutPayload);
      const sessionData = res.data;

      if (!sessionData?.success) {
        throw new Error(sessionData?.message || 'Failed to initialize checkout.');
      }

      // Branch 1: Razorpay In-Page Checkout
      if (paymentMethod === 'Razorpay') {
        if (!sessionData.razorpay_order_id || !sessionData.razorpay_key_id) {
          throw new Error('Razorpay gateway configuration is missing. Please select COD or try again.');
        }

        // Dynamically load Razorpay checkout script
        await new Promise((resolve, reject) => {
          if (document.getElementById('razorpay-checkout-js')) return resolve();
          const script = document.createElement('script');
          script.id = 'razorpay-checkout-js';
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay checkout. Check your internet connection.'));
          document.body.appendChild(script);
        });

        await new Promise((resolve, reject) => {
          const options = {
            key: sessionData.razorpay_key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_Tm3Zrmb9gAWjnG',
            amount: sessionData.razorpay_amount || Math.round(Number(sessionData.amount) * 100),
            currency: sessionData.currency || 'INR',
            name: 'Tech Crate',
            description: 'Tech Crate Prototyping Hardware Order',
            image: '/logo.png',
            order_id: sessionData.razorpay_order_id,
            notes: {
              session_id: sessionData.session_id,
            },
            prefill: {
              name: sessionData.prefill?.name || shippingAddress.fullName,
              email: sessionData.prefill?.email || user?.email || '',
              contact: sessionData.prefill?.contact || shippingAddress.phone,
            },
            theme: { color: BRAND.navy },
            handler: async function (response) {
              try {
                const verifyRes = await api.post('/payments/verify', {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  session_id: sessionData.session_id,
                });

                const finalOrderId = verifyRes.data?.final_order_id || verifyRes.data?.order_id || sessionData.session_id;
                clearCart();
                router.push(`/orders/${encodeURIComponent(finalOrderId)}?status=paid&success=true`);
                resolve(response);
              } catch (verifyErr) {
                console.warn('[Razorpay verify fallback to polling]', verifyErr);
                clearCart();
                router.push(
                  `/payment/success?razorpay_payment_id=${response.razorpay_payment_id}&session_id=${sessionData.session_id}&status=paid`
                );
                resolve(response);
              }
            },
            modal: {
              ondismiss: () => reject(new Error('Payment was cancelled.')),
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', (resp) => {
            reject(new Error(resp?.error?.description || 'Payment failed. Please try again.'));
          });
          rzp.open();
        });

        return;
      }

      // Branch 2: Cash on Delivery (COD)
      clearCart();
      const finalOrderId = sessionData.final_order_id || sessionData.order_id || sessionData.session_id;
      router.push(`/orders/${encodeURIComponent(finalOrderId)}?status=cod_placed&success=true`);
    } catch (err) {
      console.warn('[Checkout Error]:', err?.response?.data?.message || err?.message);
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
          Enter your domestic shipping destination and select your verified payment method.
        </p>
      </div>

      {/* Checkout Progress Stepper */}
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        {[
          ['1', 'Delivery Address', true],
          ['2', 'Payment Method', true],
          ['3', 'Order Confirmation', false],
        ].map(([step, title, active]) => (
          <div
            key={step}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
              active ? 'bg-sky-50 text-sky-800' : 'text-slate-400'
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                active ? 'bg-[#032762] text-white' : 'bg-slate-100 text-slate-400'
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

      {/* Account Status Pill */}
      {isAuthenticated ? (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>
              Signed in as <strong>{user?.name}</strong> ({user?.email})
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
            Verified Customer
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Already have an account?{' '}
              <Link href="/account/login?redirect=/checkout" className="font-bold underline text-brand-primary">
                Sign in
              </Link>{' '}
              to use saved addresses & sync order tracking.
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Delivery Address & Payment Method (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Delivery Address Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Delivery Address (India Only)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Recipient Full Name *
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
                  10-Digit Mobile Number (Courier OTP) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength={10}
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary font-mono"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Street / Campus / Hostel / Flat Address *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  placeholder="e.g. Hostel 12, Room 402, Engineering College Campus"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  City / Town *
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
                  State / Union Territory *
                </label>
                <select
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-brand-primary cursor-pointer"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  6-Digit Indian PIN Code *
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  maxLength={6}
                  value={shippingAddress.pincode}
                  onChange={handleInputChange}
                  placeholder="e.g. 411001"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary font-mono max-w-xs"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 p-5 pb-3 border-b border-slate-100">
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
                {paymentMethod === 'Razorpay' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-extrabold text-slate-900">UPI, Cards & NetBanking (Razorpay)</p>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        Secure RBI Gateway
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Instant checkout via Google Pay, PhonePe, Paytm, BHIM UPI QR, Debit/Credit Cards (RuPay, Visa, Mastercard) & NetBanking across 50+ Indian banks.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['UPI (GPay / PhonePe)', 'RuPay Cards', 'Credit Card', 'NetBanking', 'Wallets'].map((m) => (
                        <span
                          key={m}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-extrabold text-slate-900">Cash on Delivery (COD)</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Pay cash to the courier delivery partner when your parcel is delivered at your doorstep or campus gate.
                    </p>
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5 text-xs text-emerald-800 font-medium">
                      Exact cash change is recommended upon parcel arrival.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 3. Delivery & Guarantee Trust Strip */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              All electronic components are packed in electrostatic-discharge (ESD) safe shielding and dispatched via verified Indian couriers.
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
                <span>Items Subtotal</span>
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
                <span>Shipping Fee</span>
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

            {discountAmount > 0 && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center text-xs font-bold text-emerald-700">
                🎉 You will save ₹{Number(discountAmount).toLocaleString('en-IN')} on this order!
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50"
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
