import Link from 'next/link';
import { Shield, FileCheck, Mail, Phone, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export const metadata = {
  title: 'Grievance Redressal & Business Disclosures — TechCrate India',
  description: 'Statutory compliance details and designated Grievance Redressal Officer under the Consumer Protection (E-Commerce) Rules, 2020.',
};

export default function GrievanceRedressalPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
          style={{ backgroundColor: `${BRAND.navy}10`, color: BRAND.navy }}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Statutory Compliance Disclosure</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Grievance Redressal & Legal Disclosures
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          In accordance with the Information Technology Act, 2000 & Consumer Protection (E-Commerce) Rules, 2020
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        {/* Designated Grievance Officer Card */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-sky-600" />
            <span>1. Designated Grievance Officer</span>
          </h2>
          <p className="text-slate-600">
            For consumer grievances, escalation of unresolved tickets, or regulatory notices, please contact our appointed Grievance Officer:
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-slate-500 block text-[11px] uppercase tracking-wider">Officer Name:</span>
                <span className="font-extrabold text-slate-900">Kunal Sharma</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block text-[11px] uppercase tracking-wider">Designation:</span>
                <span className="font-semibold text-slate-800">Grievance & Compliance Officer</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block text-[11px] uppercase tracking-wider">Official Email:</span>
                <a href="mailto:grievance@techcrate.in" className="font-mono text-brand-primary font-bold hover:underline">
                  grievance@techcrate.in
                </a>
              </div>
              <div>
                <span className="font-bold text-slate-500 block text-[11px] uppercase tracking-wider">Contact Number:</span>
                <span className="font-mono text-slate-800 font-semibold">+91 83292 76568</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 mt-2">
              <span className="font-bold text-slate-500 block text-[11px] uppercase tracking-wider">Physical Office Address:</span>
              <p className="text-slate-700 leading-relaxed">
                TechCrate Electronics LLP, Pune Innovation Park, Shivaji Nagar, Pune, Maharashtra, India — 411001
              </p>
            </div>
          </div>
        </section>

        {/* SLA & Timelines */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>2. Redressal Mechanism & Resolution Timelines</span>
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>
              <strong>Acknowledgment SLA:</strong> Every consumer grievance submitted via email or support form is acknowledged with a unique ticket identifier within <strong>48 hours</strong>.
            </li>
            <li>
              <strong>Resolution SLA:</strong> The grievance officer will investigate and resolve the complaint within <strong>one month (30 days)</strong> from the date of receipt, providing detailed resolution findings.
            </li>
          </ul>
        </section>

        {/* Business Entity Disclosures */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <span>3. Business Entity & GST Details</span>
          </h2>
          <div className="space-y-1.5 text-slate-600">
            <p><strong>Entity Name:</strong> TechCrate Electronics Retail</p>
            <p><strong>Country of Origin / Registration:</strong> India</p>
            <p><strong>GST Registration:</strong> Registered under Central Goods and Services Tax (CGST / SGST Maharashtra)</p>
            <p><strong>Nature of Business:</strong> Single-vendor online store retailing electronic components, sensors, microcontrollers, and engineering robotics kits.</p>
            <p><strong>Customer Support Helpline:</strong> <a href="mailto:support@techcrate.in" className="text-brand-primary underline">support@techcrate.in</a> (Monday–Saturday, 9:00 AM – 7:00 PM IST)</p>
          </div>
        </section>
      </div>
    </div>
  );
}
