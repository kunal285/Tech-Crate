import { FileText, Shield, Scale, AlertCircle } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export const metadata = {
  title: 'Terms of Service — TechCrate India',
  description: 'Terms and conditions governing the purchase and usage of electronics hardware and maker kits on TechCrate.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
          style={{ backgroundColor: `${BRAND.navy}10`, color: BRAND.navy }}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Last updated: October 2026 • Governing laws of India & jurisdiction of Pune, Maharashtra
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <span>1. Acceptance of Platform Terms</span>
          </h2>
          <p>
            By accessing or ordering hardware from TechCrate (techcrate.in), you agree to be bound by these Terms of Service. TechCrate is a single-vendor retail platform supplying genuine electronics prototyping hardware, robotics kits, and DIY project components across India.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span>2. Educational & Prototyping Hardware Usage</span>
          </h2>
          <p>
            The products offered on this platform are intended for educational experimentation, engineering research, hobbyist prototyping, and robotics applications. Customers are responsible for verifying safe operating voltages, current capacities, and polarities prior to powering circuits. TechCrate is not liable for secondary circuit damage resulting from improper wiring or short circuits.
          </p>
        </section>

        {/* Section 3 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-indigo-600" />
            <span>3. Pricing, GST & Order Authority</span>
          </h2>
          <p>
            All listed prices are displayed in Indian National Rupees (INR) and are inclusive of statutory 18% Goods and Services Tax (GST) unless explicitly noted otherwise. The server is authoritative for final calculated prices, applicable shipping fees, and coupon validations. TechCrate reserves the right to correct typographical catalogue pricing errors before order fulfillment.
          </p>
        </section>

        {/* Section 4 */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-teal-600" />
            <span>4. Governing Law & Dispute Resolution</span>
          </h2>
          <p>
            These terms and any contracts formed hereunder shall be governed by and construed in accordance with the laws of India. Any legal dispute or proceeding arising out of or related to TechCrate shall be subject to the exclusive jurisdiction of the competent courts in Pune, Maharashtra.
          </p>
        </section>
      </div>
    </div>
  );
}
