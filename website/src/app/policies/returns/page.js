import Link from 'next/link';
import { RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export const metadata = {
  title: 'Replacement & Return Policy — TechCrate India',
  description: '7-day replacement guarantee for Dead On Arrival (DOA) or damaged electronics components.',
};

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
          style={{ backgroundColor: `${BRAND.orange}15`, color: BRAND.orange }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Maker Buyer Protection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Replacement & Return Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          7-Day Quality Guarantee on all verified microcontrollers, sensor breakout modules, and DIY kits
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>1. 7-Day Replacement Guarantee (DOA Units)</span>
          </h2>
          <p>
            If any electronic component, development board, or sensor arrives <strong>Dead On Arrival (DOA)</strong>, defective, or physically damaged in transit, you are eligible for a free replacement within <strong>7 calendar days</strong> of parcel delivery.
          </p>
          <p>
            Because semiconductors and sensors cannot be refurbished once opened, our standard remedy is a <strong>brand-new replacement unit</strong> shipped promptly via express courier.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>2. Exclusions & Electrical Mishandling</span>
          </h2>
          <p>
            Due to the delicate nature of electronic hardware, the following scenarios void warranty replacement eligibility:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Overvoltage / Polarity Reversal:</strong> Supplying voltage beyond absolute maximum ratings (e.g. connecting 12V to a 3.3V GPIO pin).</li>
            <li><strong>Soldering Mishandling:</strong> Traces lifted by excessive soldering heat, solder bridges causing short circuits, or altered component leads.</li>
            <li><strong>Physical Mishaps:</strong> Cracked IC packages, liquid submersion, or burnt silicon marks caused by accidental external shorting.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-600" />
            <span>3. How to Initiate a Replacement Request</span>
          </h2>
          <p>
            To submit a claim, visit your <Link href="/orders" className="text-brand-primary font-bold underline">Order Details</Link> or email our engineering support desk at <a href="mailto:support@techcrate.in" className="text-brand-primary font-bold underline">support@techcrate.in</a> with:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
            <li>Your Order Number (e.g. <code>#ORD-XXXXXX</code>).</li>
            <li>A brief description of your setup and the troubleshooting steps attempted (IDE serial monitor logs, multimeter readings, etc.).</li>
            <li>A clear photo or short 15-second video demonstrating the power connection and issue.</li>
          </ol>
          <p className="pt-2 text-xs text-slate-500">
            Our hardware engineers review cases within 24 hours. Upon verification, a reverse pickup is scheduled or a replacement is dispatched immediately.
          </p>
        </section>

        {/* Section 4 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <span>4. Refund Terms</span>
          </h2>
          <p>
            If a replacement component is out of stock or cannot be fulfilled, a 100% refund will be issued to your original payment method (Bank account via UPI / Netbanking / Credit Card) within <strong>3 to 5 business days</strong> following inspection approval.
          </p>
        </section>
      </div>
    </div>
  );
}
