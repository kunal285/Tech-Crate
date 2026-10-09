import { Shield } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — TechCrate',
  description: 'How TechCrate collects, protects, and handles customer and payment data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>DATA PROTECTION</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mt-1">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
          <p>
            When you register, browse, or place an order on TechCrate, we collect necessary customer details such as your name, mobile phone number, email address, campus shipping destination, and college institution name.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white">2. Payment Security</h2>
          <p>
            All digital UPI and card transactions are processed securely through RBI-compliant payment gateways (AutoUPI / PayCow / UPI Rails). TechCrate does not store, log, or have access to your bank account passwords, UPI MPINs, or debit card credentials.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white">3. How Your Data Is Used</h2>
          <p>
            Your information is used strictly to fulfill your orders, provide dispatch tracking SMS notifications, generate GST tax invoices, and offer maker technical assistance. We never sell customer records to third-party advertising companies.
          </p>
        </section>
      </div>
    </div>
  );
}
