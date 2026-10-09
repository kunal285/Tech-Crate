import Link from 'next/link';
import { RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Replacement & Return Policy — TechCrate',
  description: '7-day replacement warranty for defective or damaged electronic components.',
};

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>BUYER PROTECTION</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Replacement & Refund Policy</h1>
        <p className="text-sm text-slate-400 mt-1">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>1. 7-Day Replacement Guarantee</span>
          </h2>
          <p>
            If any electronic component, development board, or sensor arrives <strong>Dead On Arrival (DOA)</strong> or with a manufacturing defect, you are eligible for an immediate replacement within <strong>7 days of delivery</strong>.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>2. Exclusions & Soldering Terms</span>
          </h2>
          <p>
            Due to the delicate nature of electronics, the following are not covered under the free replacement policy:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>Boards damaged by incorrect voltage input or reversed power polarity.</li>
            <li>Chips or headers with poor soldering attempts or burned traces.</li>
            <li>Mechanical damage or water/liquid exposure occurring after receipt.</li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white">3. How to Request a Replacement</h2>
          <p>
            Simply reach out to us at <a href="mailto:support@techcrate.in" className="text-brand-primary underline">support@techcrate.in</a> or through our <Link href="/contact" className="text-brand-primary underline">Contact Form</Link> with:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-slate-300">
            <li>Your Order Number (#XXXXXX)</li>
            <li>A short video or photo demonstrating the power supply and issue</li>
            <li>Our technical support team will evaluate and dispatch a replacement unit within 24 hours.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
