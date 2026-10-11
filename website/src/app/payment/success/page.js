'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { BRAND } from '@/theme/tokens';

const MAX_CHECKS = 10;
const CHECK_INTERVAL_MS = 2000;

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('Confirming your payment...');
  const [error, setError] = useState('');
  const confirmationStarted = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Support both legacy order_id and new Razorpay session_id / razorpay_payment_id params
    const returnedOrderId =
      params.get('session_id') ||
      params.get('order_id') ||
      params.get('orderId') ||
      params.get('razorpay_payment_id') ||
      '';
    if (returnedOrderId) {
      setOrderId(returnedOrderId);
    } else {
      setError('The payment return did not include an order reference.');
    }
  }, []);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    let checks = 0;

    const verifyPayment = async () => {
      try {
        const response = await api.get(`/payments/${encodeURIComponent(orderId)}/status`);
        if (cancelled) return;

        if (response.data?.isPaid || response.data?.status === 'paid') {
          if (confirmationStarted.current) return;
          confirmationStarted.current = true;
          await clearCart();
          const finalId = response.data?.final_order_id || orderId;
          router.replace(`/orders/${encodeURIComponent(finalId)}?status=paid`);
          return;
        }

        checks += 1;
        if (checks < MAX_CHECKS) {
          setMessage('Payment received by the gateway. Waiting for final confirmation...');
          window.setTimeout(verifyPayment, CHECK_INTERVAL_MS);
        } else {
          setMessage('Your payment is still being confirmed. You can check the order status below.');
        }
      } catch (verificationError) {
        if (cancelled) return;
        setError(
          verificationError?.response?.data?.message ||
            'We could not confirm the payment status right now.'
        );
      }
    };

    verifyPayment();
    return () => {
      cancelled = true;
    };
  }, [clearCart, orderId, router]);

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-rose-500" />
        <h1 className="text-xl font-bold text-slate-900">Payment confirmation unavailable</h1>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        {orderId && (
          <Link
            href={`/orders/${encodeURIComponent(orderId)}`}
            className="mt-6 inline-flex rounded-xl px-5 py-2.5 text-sm font-bold text-white"
            style={{ backgroundColor: BRAND.navy }}
          >
            View order
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle className="h-10 w-10 text-emerald-500" />
      </div>
      <h1 className="text-2xl font-black text-slate-900">Payment successful</h1>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      {!error && !message.includes('still') && (
        <Loader2 className="mx-auto mt-6 h-5 w-5 animate-spin text-emerald-500" />
      )}
      {message.includes('still') && orderId && (
        <Link
          href={`/orders/${encodeURIComponent(orderId)}`}
          className="mt-6 inline-flex rounded-xl px-5 py-2.5 text-sm font-bold text-white"
          style={{ backgroundColor: BRAND.navy }}
        >
          Continue to order
        </Link>
      )}
    </div>
  );
}
