'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ZoomIn, Sparkles } from 'lucide-react';
import { BRAND } from '@/theme/tokens';

export default function ImageGallery({
  images = [],
  title = 'TechCrate Product',
  discountPercent = 0,
  isLowStock = false,
  stock = 10,
}) {
  const fallback = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80';

  // Clean image list up to 5 slots
  const validImages =
    Array.isArray(images) && images.filter(Boolean).length > 0
      ? images.filter(Boolean).slice(0, 5)
      : [fallback];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [imgSrc, setImgSrc] = useState(validImages[0] || fallback);

  useEffect(() => {
    setImgSrc(validImages[selectedIndex] || fallback);
  }, [selectedIndex, images]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Main Showcase Stage (Matches Mobile showcaseCard) */}
      <div
        className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm group cursor-crosshair"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={imgSrc}
          alt={`${title} - View ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={() => setImgSrc(fallback)}
          className={`object-contain p-6 transition-transform duration-200 ${
            isZoomed ? 'scale-150 origin-[var(--zoom-x)_var(--zoom-y)]' : 'scale-100'
          }`}
          style={{
            '--zoom-x': `${zoomPos.x}%`,
            '--zoom-y': `${zoomPos.y}%`,
          }}
        />

        {/* Overlay Badges (Matches Mobile overlayBadges) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide text-white shadow-sm"
              style={{ backgroundColor: BRAND.orange }}
            >
              <Sparkles className="w-3 h-3 text-white" />
              <span>{discountPercent}% OFF</span>
            </div>
          )}
          {isLowStock && (
            <div className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500 text-white shadow-sm">
              Only {stock} Left!
            </div>
          )}
        </div>

        {/* Image Counter (Matches Mobile imageCounter) */}
        {validImages.length > 1 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur-sm text-white text-[11px] font-bold z-10">
            {selectedIndex + 1} / {validImages.length}
          </div>
        )}

        {/* Zoom Hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-slate-600 text-xs border border-slate-200 shadow-sm pointer-events-none group-hover:opacity-0 transition-opacity">
          <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] font-medium">Hover to zoom</span>
        </div>
      </div>

      {/* Thumbnail Strip (Matches Mobile thumbnailRow) */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {validImages.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden bg-white border-2 transition-all p-1 shrink-0 ${
                  isSelected
                    ? 'border-brand-primary ring-2 ring-brand-primary/20 shadow-sm scale-105'
                    : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`${title} thumbnail ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
