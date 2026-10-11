'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Phone,
  Mail,
  FileText,
  ChevronDown,
  Search,
  ExternalLink,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { BRAND } from '@/theme/tokens';

const FAQS = [
  {
    q: 'How fast is campus hostel delivery across India?',
    a: 'Orders placed before 2:00 PM are dispatched the same day via express air couriers (Bluedart, Delhivery). Delivery typically takes 24–48 hours for metro cities and 2–4 days for university campuses across India.',
  },
  {
    q: 'What is the Dead-on-Arrival (DOA) replacement policy for microcontrollers?',
    a: 'All silicon chips, breakout modules, and sensors come with a 7-day hassle-free replacement guarantee. If a component fails to power on or pass serial boot tests out-of-the-box, we ship a free replacement immediately.',
  },
  {
    q: 'Are all sensors and development boards 100% genuine?',
    a: 'Yes. Tech Crate sources directly from authorized manufacturers and tier-1 component distributors. Every board features authentic silicon with clear silk-screen markings and tested solder joints.',
  },
  {
    q: 'How can I get a GST invoice for my college robotics lab or hackathon team?',
    a: 'You can add your institution GSTIN number during checkout. All invoices include 18% GST breakdown, HSN codes, and official digital signatures suitable for college lab reimbursements.',
  },
  {
    q: 'Where can I find wiring pinouts and sample code for project kits?',
    a: 'Every product page includes a direct datasheet link and sample code download. You can also explore our Engineering Project Hub or ask our AI Shopping Assistant for circuit schematics.',
  },
];

export default function HelpAndFaqSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  const filteredFaqs = FAQS.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Helpline & Direct Support Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <a
          href="tel:+918329276568"
          className="p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex items-start gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Phone className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Maker Helpline
            </h4>
            <p className="text-xs font-mono font-bold text-emerald-700">+91 83292 76568</p>
            <p className="text-[10px] text-slate-500">Mon - Sat, 9 AM - 8 PM IST</p>
          </div>
        </a>

        <a
          href="mailto:support@techcrate.in"
          className="p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex items-start gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
              Email Support
            </h4>
            <p className="text-xs font-bold text-blue-700">support@techcrate.in</p>
            <p className="text-[10px] text-slate-500">Fast 4-hour ticket turnaround</p>
          </div>
        </a>

        <Link
          href="/contact"
          className="p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex items-start gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
              Support Center
            </h4>
            <p className="text-xs font-bold text-purple-700">Submit Inquiry Form</p>
            <p className="text-[10px] text-slate-500">Track RMA & campus orders</p>
          </div>
        </Link>
      </div>

      {/* 2. Interactive Searchable FAQs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant answers regarding campus dispatch, DOA returns, and GST invoicing.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Official Store Policies & Legal Links Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Legal & Compliance Documentation
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { label: 'Shipping Policy', href: '/policies/shipping' },
            { label: 'Returns & DOA', href: '/policies/returns' },
            { label: 'Cancellation', href: '/policies/cancellation' },
            { label: 'Warranty Terms', href: '/policies/warranty' },
            { label: 'Privacy Policy', href: '/policies/privacy' },
            { label: 'Terms of Use', href: '/policies/terms' },
          ].map((policy, idx) => (
            <Link
              key={idx}
              href={policy.href}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-[11px] font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              <span className="truncate">{policy.label}</span>
              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Official Social Media Channels */}
      <div className="p-4.5 rounded-2xl bg-slate-100/80 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-900">
            Connect with the Tech Crate Maker Community
          </h4>
          <p className="text-[11px] text-slate-500">
            Watch hardware build tutorials, code snippets, and hackathon showcases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[
            { name: 'YouTube', href: 'https://youtube.com/@techcrate' },
            { name: 'Instagram', href: 'https://instagram.com/techcrate.in' },
            { name: 'LinkedIn', href: 'https://linkedin.com/company/techcrate' },
            { name: 'GitHub', href: 'https://github.com/techcrate' },
          ].map((s, idx) => (
            <a
              key={idx}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-slate-300 text-xs font-bold transition-all shadow-2xs"
            >
              {s.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
