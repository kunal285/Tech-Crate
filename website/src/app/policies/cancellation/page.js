import Link from 'next/link';
import { XCircle, Clock, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export const metadata = {
  title: 'Order Cancellation Policy — TechCrate India',
  description: 'Understand cancellation windows, immediate pre-dispatch cancellations, and instant refund timelines on TechCrate.',
};

export default function CancellationPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
          style={{ backgroundColor: `${BRAND.navy}10`, color: BRAND.navy }}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Order Management</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Cancellation Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Clear, consumer-friendly cancellation and refund processes before parcel dispatch
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-600" />
            <span>1. Cancellation Before Dispatch (One-Click Cancellation)</span>
          </h2>
          <p>
            You can cancel any unfulfilled order at zero penalty before it has been marked as <strong>Dispatched / Shipped</strong>.
          </p>
          <p>
            To cancel an order, navigate to your <Link href="/orders" className="text-brand-primary font-bold underline">Orders Page</Link>, select the order, and click the <strong>&quot;Cancel Order&quot;</strong> button. The cancellation request is processed immediately, releasing reserved stock and triggering refund reconciliation.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span>2. Orders Already Dispatched / In Transit</span>
          </h2>
          <p>
            Once an order is handed over to our courier partners and assigned an active AWB tracking number, direct cancellation is no longer possible through the portal.
          </p>
          <p>
            In such cases, you can simply <strong>refuse delivery</strong> when the courier delivery executive arrives at your doorstep or campus gate. Once the parcel is returned to our warehouse as an RTO (Return to Origin), our system processes a full refund for prepaid orders.
          </p>
        </section>

        {/* Section 3 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-emerald-600" />
            <span>3. Refund Timelines for Pre-Dispatch Cancellations</span>
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>UPI Payments (Google Pay, PhonePe, Paytm, BHIM):</strong> Refunds are initiated through the gateway within 24 hours and typically reflect within <strong>24 to 48 hours</strong> back into your linked bank account.</li>
            <li><strong>Debit / Credit Cards & NetBanking:</strong> Settled back to the issuing bank within <strong>3 to 5 business days</strong> depending on your bank&apos;s settlement schedule.</li>
            <li><strong>Cash on Delivery (COD) Orders:</strong> No financial charge was collected, so the order is closed immediately upon cancellation.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <span>4. Cancellations Initiated by TechCrate</span>
          </h2>
          <p>
            TechCrate reserves the right to cancel an order under exceptional operational circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Unserviceable or non-deliverable PIN code by all courier partners.</li>
            <li>Inaccurate or suspicious payment authorization flags reported by the payment gateway fraud detection system.</li>
            <li>Unintended inventory discrepancies (in which case the customer is notified immediately and issued a 100% prompt refund).</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
