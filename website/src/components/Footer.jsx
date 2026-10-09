'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, CreditCard, Award, Heart, Bot } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { BRAND } from '@/theme/tokens';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600">
      {/* 1. Value Badges Banner */}
      <div className="border-b border-slate-100 py-6 bg-slate-50/50">
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
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Student Friendly</h4>
                <p className="text-[11px] text-slate-500">Free schematics & code</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Intro */}
          <div className="lg:col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                <Image
                  src="/logo.png"
                  alt="Tech Crate"
                  fill
                  className="object-contain"
                  onError={(e) => {
                    // Fallback handled gracefully
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
              Everything you need to build robotics, IoT projects, and electronics prototypes.
              Delivering authentic development boards, sensors, and maker kits across India.
            </p>
            <div className="pt-1">
              <Link
                href="/ai-assistant"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: BRAND.navy }}
              >
                <Bot className="w-3.5 h-3.5 text-brand-cyan" />
                <span>AI Shopping Assistant</span>
              </Link>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-3">
              Categories
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
                  View All Hardware →
                </Link>
              </li>
            </ul>
          </div>

          {/* Maker Education */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-3">
              DIY Projects Hub
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/projects" className="text-slate-600 hover:text-brand-primary transition-colors">
                  IoT Project Kits
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Robotics & Automation
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Circuit Schematics
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Source Code Downloads
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Student Starter Kits
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Support */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-3">
              Help & Policies
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/orders" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-slate-600 hover:text-brand-primary transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-slate-600 hover:text-brand-primary transition-colors">
                  My Account
                </Link>
              </li>
              {/* <li>
                <a
                  href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5173'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-brand-primary transition-colors flex items-center gap-1 font-medium"
                >
                  Admin Portal ↗
                </a>
              </li> */}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} Tech Crate. Built for Indian makers & engineers.</p>
          <div className="flex items-center gap-1 text-slate-400">
            Designed with <Heart className="w-3.5 h-3.5 text-red-500 fill-current mx-0.5" /> for Maker Community
          </div>
        </div>
      </div>
    </footer>
  );
}
