'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, CreditCard, Award, Heart, HelpCircle, MapPin, Phone, Mail } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { BRAND } from '@/theme/tokens';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600">
      {/* 1. Value Badges Banner */}
      <div className="border-b border-slate-100 py-6 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${BRAND.navy}10`, color: BRAND.navy }}
              >
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Fast Dispatch</h4>
                <p className="text-[11px] text-slate-500">Free delivery on ₹499+</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${BRAND.orange}15`, color: BRAND.orange }}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">100% Genuine</h4>
                <p className="text-[11px] text-slate-500">Tested maker hardware</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${BRAND.cyan}20`, color: BRAND.navy }}
              >
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Instant UPI & COD</h4>
                <p className="text-[11px] text-slate-500">Safe, verified payments</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${BRAND.primary}15`, color: BRAND.primary }}
              >
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">7-Day Warranty</h4>
                <p className="text-[11px] text-slate-500">Free replacement support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Intro & Business Disclosures */}
          <div className="lg:col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                <Image
                  src="/logo.png"
                  alt="Tech Crate"
                  width={32}
                  height={32}
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <span
                className="font-extrabold text-xl tracking-tight"
                style={{ color: BRAND.navy }}
              >
                Tech Crate
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
              India&apos;s single-vendor online hardware store for authentic microcontrollers, sensor breakout boards, robotics modules, and IoT DIY kits.
            </p>

            <div className="pt-1 text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Pune Innovation Park, Maharashtra, India 411001</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href="mailto:support@techcrate.in" className="hover:text-brand-primary">support@techcrate.in</a>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>+91 98765 43210 (Mon–Sat 9AM–7PM IST)</span>
              </div>
            </div>

            {/* Accepted Indian Payment Badges */}
            <div className="pt-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                Supported Indian Payment Methods
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['UPI / GPay / PhonePe', 'RuPay & Debit Cards', 'NetBanking', 'Cash on Delivery'].map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-3">
              Hardware Catalog
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              {CATEGORIES.slice(1, 6).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/products?category=${encodeURIComponent(c.id)}`}
                    className="text-slate-600 hover:text-brand-primary transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/products" className="text-brand-primary font-bold hover:underline">
                  Browse All Hardware →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Orders */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-3">
              Customer Support
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/orders" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-slate-600 hover:text-brand-primary transition-colors">
                  My Account & Invoices
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Cart & Checkout
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Contact Support Desk
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-slate-600 hover:text-brand-primary transition-colors">
                  DIY Project Tutorials
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Legal */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-3">
              Policies & Legal
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/policies/shipping" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Replacement & Returns
                </Link>
              </li>
              <li>
                <Link href="/policies/cancellation" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/warranty" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Warranty & Quality Guarantee
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/policies/grievance" className="text-emerald-700 font-bold hover:underline">
                  Grievance Redressal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Statutory Disclosures */}
        <div className="border-t border-slate-100 mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>
            © {new Date().getFullYear()} Tech Crate. Single-vendor online store operating in India. Prices inclusive of 18% GST.
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            Engineered with <Heart className="w-3.5 h-3.5 text-red-500 fill-current mx-0.5" /> for the Indian Maker Community
          </div>
        </div>
      </div>
    </footer>
  );
}
