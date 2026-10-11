'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Award,
  Heart,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Linkedin,
  Github,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { BRAND } from '@/theme/tokens';

function WhatsAppIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.888 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

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
          <div className="lg:col-span-2 space-y-3.5">
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
              India&apos;s online hardware store for authentic microcontrollers, sensor breakout boards, robotics modules, and IoT DIY kits.
            </p>

            <div className="pt-1 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Pune Innovation Park, Maharashtra, India 411001</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href="mailto:support@techcrate.in" className="hover:text-blue-600 transition-colors">
                  support@techcrate.in
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <a
                  href="tel:+918329276568"
                  className="hover:text-blue-600 font-semibold text-slate-800 transition-colors"
                >
                  +91 83292 76568
                </a>
                <span className="text-slate-400 text-[11px]">(Mon–Sat 9AM–7PM IST)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 shrink-0">
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                </span>
                <a
                  href="https://wa.me/918329276568"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-bold transition-colors"
                >
                  WhatsApp: +91 83292 76568
                </a>
              </div>
            </div>

            {/* Social Media Links Block */}
            <div className="pt-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                Social Media & Community
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/918329276568"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-all shadow-2xs"
                  title="WhatsApp Support: +91 83292 76568"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="https://instagram.com/kunalgavit28"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-pink-600 hover:bg-pink-50 hover:border-pink-200 transition-all shadow-2xs"
                  title="Instagram: @techcrate.in"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/in/kunalgavit285"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-2xs"
                  title="LinkedIn: Tech Crate"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/kunal285"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 hover:border-slate-300 transition-all shadow-2xs"
                  title="GitHub: Tech Crate"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Supported Payment Methods */}
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

        {/* Bottom Bar with Statutory Disclosures & Social Links */}
        <div className="border-t border-slate-100 mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} Tech Crate. Single-vendor online store operating in India.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Follow Tech Crate:</span>
            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/918329276568"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/techcrate.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-pink-600 transition-colors p-1"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/in/kunalgavit285"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/techcrate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-900 transition-colors p-1"
                aria-label="GitHub"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            Engineered with <Heart className="w-3.5 h-3.5 text-red-500 fill-current mx-0.5" /> for Makers
          </div>
        </div>
      </div>
    </footer>
  );
}
