'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, CheckCircle2, Headphones, Clock, ShieldCheck } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Component Inquiry',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Component Inquiry',
        message: '',
      });
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm text-center max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
          style={{ backgroundColor: `${BRAND.navy}10`, color: BRAND.navy }}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>Maker Support & Engineering Desk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Get in Touch with TechCrate
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed">
          Questions about a sensor pinout, need a college club quotation, or have order inquiries? Our electronics engineers and support team are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Contact Info Cards (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${BRAND.navy}10`, color: BRAND.navy }}
            >
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Email Engineering Desk</h3>
            <p className="text-xs text-slate-500">For inquiries, bulk college orders, and quotes:</p>
            <a
              href="mailto:support@techcrate.in"
              className="text-xs sm:text-sm font-bold text-brand-primary hover:underline block font-mono"
            >
              support@techcrate.in
            </a>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${BRAND.primary}15`, color: BRAND.primary }}
            >
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">WhatsApp & Phone Helpline</h3>
            <p className="text-xs text-slate-500">Mon to Sat, 9:00 AM – 7:00 PM IST:</p>
            <div className="space-y-1">
              <a
                href="tel:+918329276568"
                className="text-xs sm:text-sm font-bold text-blue-600 hover:underline block font-mono"
              >
                +91 83292 76568
              </a>
              <a
                href="https://wa.me/918329276568"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-600 hover:underline block"
              >
                Chat on WhatsApp →
              </a>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${BRAND.orange}15`, color: BRAND.orange }}
            >
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Fulfillment Hub</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              TechCrate Electronics Lab & Dispatch Facility<br />
              Pune Innovation Park, Shivaji Nagar, Pune, Maharashtra 411001, India
            </p>
          </div>

          {/* Grievance Quick Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Consumer Protection & Grievances</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Need grievance escalation? View our statutory{' '}
              <Link href="/policies/grievance" className="text-brand-primary font-bold underline">
                Grievance Redressal Mechanism
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="md:col-span-7 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">Message Dispatched!</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Thank you for reaching out to TechCrate. A hardware engineer or support representative will respond to your inquiry within 4 business hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="pb-2 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Send Us a Direct Message</h2>
                <p className="text-xs text-slate-500">We respond to all technical queries within 4 business hours.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kunal Sharma"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-primary focus:bg-white outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. you@college.edu"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-primary focus:bg-white outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Phone (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-primary focus:bg-white outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Topic / Category</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:border-brand-primary focus:bg-white outline-none cursor-pointer transition-colors"
                  >
                    <option value="Component Inquiry">Component & Datasheet Inquiry</option>
                    <option value="Order Status">Order Tracking & Delivery</option>
                    <option value="Bulk College Order">College Club / Bulk Quotation</option>
                    <option value="Replacement">Replacement or Defective Unit (7-Day)</option>
                    <option value="Other">General Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe the component, pinout inquiry, or order details..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-primary focus:bg-white outline-none resize-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
                style={{ backgroundColor: BRAND.navy }}
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
