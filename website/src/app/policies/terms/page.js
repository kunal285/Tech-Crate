import { FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service — TechCrate',
  description: 'Terms and conditions governing the purchase of electronics hardware on TechCrate.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-3">
          <FileText className="w-3.5 h-3.5" />
          <span>LEGAL AGREEMENT</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Terms of Service</h1>
        <p className="text-sm text-slate-400 mt-1">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white">1. Use of Platform & Educational Hardware</h2>
          <p>
            TechCrate sells hardware modules, development boards, and DIY kits designed primarily for educational, engineering prototyping, robotics, and IoT research. Customers are responsible for verifying electrical ratings (voltage, polarity, current limits) prior to circuit powering.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white">2. Pricing & Invoicing</h2>
          <p>
            All listed prices in Indian National Rupees (INR) include standard 18% Goods and Services Tax (GST). TechCrate reserves the right to modify component catalog pricing based on global semiconductor availability.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-white">3. Open-Source Code & Firmware</h2>
          <p>
            Sample code snippets and circuit schematics hosted on our Project Hub are provided as open-source references without implied commercial warranty. Makers are welcome to customize and adapt them for academic or personal projects.
          </p>
        </section>
      </div>
    </div>
  );
}
