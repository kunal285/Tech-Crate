'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Wrench, ChevronRight } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export default function ProjectCard({ kit }) {
  if (!kit) return null;

  const id = kit._id || kit.id;
  const title = kit.title || kit.name || 'Project Kit';
  const description = kit.description || kit.subtitle || 'Complete project kit with components and code.';
  const price = kit.price ? Number(kit.price).toLocaleString('en-IN') : '1,499';
  const difficulty = kit.difficulty || 'Beginner';
  const category = kit.category || 'Electronics';
  
  const rawImage = Array.isArray(kit.images) ? kit.images[0] : (kit.image || kit.imageUrl);
  const imageUrl = typeof rawImage === 'string' && rawImage.startsWith('http')
    ? rawImage
    : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Image Container with Difficulty Badge */}
      <div className="relative w-full h-36 bg-slate-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 260px, 320px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div
          className="absolute top-2.5 left-2.5 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded shadow-sm z-10"
          style={{ backgroundColor: BRAND.orange }}
        >
          {difficulty}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <span
            className="text-[10px] font-extrabold uppercase tracking-wider block mb-1"
            style={{ color: BRAND.orange }}
          >
            {category}
          </span>
          <Link href={`/projects/${id}`} className="block">
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-primary line-clamp-1 transition-colors">
              {title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
              Kit Price
            </span>
            <span className="text-base font-extrabold text-slate-900 leading-none" style={{ color: BRAND.navy }}>
              ₹{price}
            </span>
          </div>

          <Link
            href={`/projects/${id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            style={{ backgroundColor: BRAND.navy }}
          >
            <span>View Kit</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
