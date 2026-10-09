'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export default function PaymentFailedPage() {
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderId(params.get('order_id') || params.get('orderId') || '');
  }, []);

  return (
    <div className="max-w-md mx-auto my-12 rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
        <XCircle className="h-10 w-10 text-rose-500" />
      </div>
      <h1 className="text-2xl font-black text-slate-900">Payment failed</h1>
      <p className="mt-2 text-sm text-slate-500">
        The payment was cancelled or could not be completed. Your order is still available so you
        can try again.
      </p>
      <Link
        href={orderId ? `/orders/${encodeURIComponent(orderId)}` : '/orders'}
        className="mt-6 inline-flex rounded-xl px-5 py-2.5 text-sm font-bold text-white"
        style={{ backgroundColor: BRAND.navy }}
      >
        {orderId ? 'Try payment again' : 'View my orders'}
      </Link>
    </div>
  );
}
