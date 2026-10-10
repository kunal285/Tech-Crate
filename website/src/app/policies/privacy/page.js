import { Shield, Lock, Eye, Database, FileText } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export const metadata = {
  title: 'Privacy Policy — TechCrate India',
  description: 'How TechCrate collects, protects, and handles customer and payment data in accordance with Indian Data Protection principles.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
          style={{ backgroundColor: `${BRAND.navy}10`, color: BRAND.navy }}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Data Privacy & Security</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Last updated: October 2026 • Compliant with Indian Information Technology & DPDP Standards
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-600" />
            <span>1. Information We Collect</span>
          </h2>
          <p>
            When you register, browse, or place an order on TechCrate, we collect essential information required to fulfill your orders and provide customer assistance:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li><strong>Personal Contact Information:</strong> Name, mobile phone number, email address, campus shipping destination, hostel/room number, and pin code.</li>
            <li><strong>Order History:</strong> Snapshots of products ordered, transaction identifiers, delivery status, and GST tax invoice records.</li>
            <li><strong>Technical Telemetry:</strong> Anonymized browser information, IP address, and cookie sessions necessary for maintaining your shopping cart.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <span>2. Zero Financial Credential Storage (RBI Guidelines)</span>
          </h2>
          <p>
            All digital payment transactions (UPI, Credit/Debit cards, NetBanking) are processed strictly via certified, RBI-licensed payment aggregators (e.g., Razorpay).
          </p>
          <p className="font-semibold text-slate-800">
            TechCrate does not store, process, or transmit your credit card numbers, CVVs, netbanking passwords, or UPI PINs.
          </p>
        </section>

        {/* Section 3 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <span>3. How We Use and Protect Customer Information</span>
          </h2>
          <p>
            Your data is strictly utilized for operational e-commerce functions:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Packing, addressing, and dispatching consignments via courier partners.</li>
            <li>Sending SMS and WhatsApp delivery updates, tracking links, and GST tax invoices.</li>
            <li>Preventing fraudulent orders and maintaining audit records mandated by Indian accounting regulations.</li>
          </ul>
          <p className="pt-2 font-semibold text-emerald-700">
            We never sell, rent, or trade your personal information with external advertising agencies or brokers.
          </p>
        </section>

        {/* Section 4 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>4. Data Retention & Customer Rights</span>
          </h2>
          <p>
            You may request an update, export, or deletion of your customer profile at any time by contacting our privacy desk at <a href="mailto:privacy@techcrate.in" className="text-brand-primary underline">privacy@techcrate.in</a>. Order invoice records are retained in compliance with statutory Indian GST and taxation record-keeping obligations.
          </p>
        </section>
      </div>
    </div>
  );
}
