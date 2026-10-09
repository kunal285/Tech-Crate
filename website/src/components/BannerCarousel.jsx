'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

const DEFAULT_BANNERS = [
  {
    _id: 'default-1',
    title: 'Next-Gen ESP32 & IoT Ecosystems',
    subtitle: 'Dual-core processing, Wi-Fi + BLE 5.0, high-speed peripherals for smart embedded projects.',
    badgeText: 'HOT NEW RELEASE',
    buttonText: 'Explore Microcontrollers',
    buttonLink: '/products?category=Microcontrollers',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80',
  },
  {
    _id: 'default-2',
    title: 'Precision Sensors & Robotics Modules',
    subtitle: 'IMUs, LiDAR, environmental sensing, high-torque drivers engineered for makers & engineers.',
    badgeText: 'BEST VALUE',
    buttonText: 'Browse Sensors',
    buttonLink: '/products?category=Sensors',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80',
  },
  {
    _id: 'default-3',
    title: 'Hands-on DIY Project Kits & Code Hub',
    subtitle: 'Curated complete hardware kits with circuit schematics and production-ready source code.',
    badgeText: 'LEARN & BUILD',
    buttonText: 'View Project Hub',
    buttonLink: '/projects',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80',
  },
];

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await api.get('/posters/active');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setBanners(res.data);
        } else {
          setBanners(DEFAULT_BANNERS);
        }
      } catch {
        setBanners(DEFAULT_BANNERS);
      }
    }
    fetchBanners();
  }, []);

  const slideList = banners.length > 0 ? banners : DEFAULT_BANNERS;

  useEffect(() => {
    if (isPaused || slideList.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideList.length);
    }, 5500);

    return () => clearInterval(timerRef.current);
  }, [isPaused, slideList.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slideList.length) % slideList.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slideList.length);
  };

  const getTargetLink = (banner) => {
    if (banner.buttonLink && banner.buttonLink.trim()) return banner.buttonLink;
    if (banner.linkType === 'category' && banner.linkValue) {
      return `/products?category=${encodeURIComponent(banner.linkValue)}`;
    }
    if (banner.linkType === 'product' && banner.linkValue) {
      return `/products/${banner.linkValue}`;
    }
    if (banner.linkType === 'project' && banner.linkValue) {
      return `/projects/${banner.linkValue}`;
    }
    return '/products';
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-md border border-slate-200/80 my-4 group"
      style={{ backgroundColor: BRAND.navy }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background with Mobile-Matching 16:9 / Responsive Aspect */}
      <div className="relative h-[240px] sm:h-[320px] md:h-[380px] w-full">
        {slideList.map((banner, idx) => (
          <div
            key={banner._id || idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={banner.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80'}
              alt={banner.title || 'TechCrate Promo'}
              fill
              priority={idx === 0}
              className="object-cover object-center transform group-hover:scale-105 transition-transform duration-1000"
              sizes="100vw"
            />
            {/* Dark Brand Navy Overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#032762] via-[#032762]/85 to-transparent"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#032762]/90 via-transparent to-transparent"
            />

            {/* Banner Text Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-2xl">
              {banner.badgeText && (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wider uppercase text-white w-fit mb-2.5 shadow-sm"
                  style={{ backgroundColor: BRAND.orange }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{banner.badgeText}</span>
                </div>
              )}

              <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
                {banner.title}
              </h2>

              {(banner.subtitle || banner.customText) && (
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-slate-100/90 line-clamp-2 md:line-clamp-3 leading-relaxed drop-shadow-sm">
                  {banner.subtitle || banner.customText}
                </p>
              )}

              <div className="mt-4 sm:mt-6 flex items-center gap-3">
                <Link
                  href={getTargetLink(banner)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md active:scale-95 transition-all"
                  style={{ backgroundColor: BRAND.orange }}
                >
                  <span>{banner.buttonText || 'Shop Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/projects"
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/30 backdrop-blur-sm transition-all"
                >
                  Code Hub
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next Navigation Arrows */}
      {slideList.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous Banner"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slideList.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 backdrop-blur-sm">
          {slideList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'w-6 h-2'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
              style={{
                backgroundColor: idx === currentIndex ? BRAND.orange : undefined,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
