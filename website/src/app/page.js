'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Eye,
  Radio,
  Zap,
  Layers,
  Wrench,
  Bot,
  Package,
  Sparkles,
  ChevronRight,
  Hammer,
  Monitor,
  Wifi,
} from 'lucide-react';
import BannerCarousel from '@/components/BannerCarousel';
import StatsRow from '@/components/StatsRow';
import ProductCard from '@/components/ProductCard';
import ProjectCard from '@/components/ProjectCard';
import { CATEGORIES } from '@/lib/constants';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

const CATEGORY_ICONS = {
  Microcontrollers: Cpu,
  Sensors: Eye,
  'Motors & Drivers': Wrench,
  'Wireless & IoT': Wifi,
  Displays: Monitor,
  'Power & Battery': Zap,
  'Components & Passives': Package,
  'Project Kits': Hammer,
  'Tools & Prototyping': Wrench,
};

function SectionHeader({ title, subtitle, seeAllLink }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>
        )}
      </div>
      {seeAllLink && (
        <Link
          href={seeAllLink}
          className="inline-flex items-center gap-0.5 text-xs font-bold transition-colors hover:opacity-80"
          style={{ color: BRAND.navy }}
        >
          <span>See All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [featuredKits, setFeaturedKits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setIsLoading(true);
        const [trendRes, recRes, projRes] = await Promise.allSettled([
          api.get('/products?limit=8&sort=trending'),
          api.get('/products?limit=8&sort=recommended'),
          api.get('/projects?limit=4'),
        ]);

        if (trendRes.status === 'fulfilled') {
          const data = trendRes.value.data;
          setTrending(Array.isArray(data) ? data : data.products || []);
        }

        if (recRes.status === 'fulfilled') {
          const data = recRes.value.data;
          setRecommended(Array.isArray(data) ? data : data.products || []);
        }

        if (projRes.status === 'fulfilled') {
          const data = projRes.value.data;
          setFeaturedKits(Array.isArray(data) ? data : data.projects || []);
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dynamic Promotional Posters Carousel */}
      <BannerCarousel />

      {/* 2. Stats Row (Products, Projects, Students, Rating) */}
      <StatsRow />

      {/* 3. AI Shopping Assistant Banner */}
      <Link
        href="/ai-assistant"
        className="block group relative overflow-hidden rounded-2xl p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.99] bg-[#032762]"
        style={{ backgroundColor: BRAND.navy }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: BRAND.orange }} />
              <span
                className="text-[11px] font-extrabold uppercase tracking-wider"
                style={{ color: BRAND.orange }}
              >
                AI Shopping Assistant
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              Tell me your project!
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
              Get component suggestions, pinouts & budget estimates tailored for your hardware idea.
            </p>
          </div>

          <div className="shrink-0">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-inner group-hover:scale-105 transition-transform"
              style={{
                backgroundColor: BRAND.primary,
                borderColor: BRAND.cyan,
              }}
            >
              <Bot className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </Link>

      {/* 4. Popular Categories */}
      <section className="pt-2">
        <SectionHeader
          title="Popular Categories"
          subtitle="Browse by component type"
          seeAllLink="/products"
        />
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
            const Icon = CATEGORY_ICONS[cat.name] || Cpu;
            const tintColor = cat.color || BRAND.navy;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.id)}`}
                className="group flex flex-col items-center text-center p-2 rounded-xl transition-all hover:-translate-y-0.5"
              >
                <div
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-2 transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: `${tintColor}15`,
                    color: tintColor,
                  }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 group-hover:text-slate-900 line-clamp-1 leading-tight">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Featured Project Kits */}
      <section className="pt-2">
        <SectionHeader
          title="Featured Project Kits"
          subtitle="Complete kits with components + tutorials"
          seeAllLink="/projects"
        />
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : featuredKits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredKits.map((kit) => (
              <ProjectCard key={kit._id || kit.id} kit={kit} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
            <Hammer className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              No project kits loaded right now.
            </p>
          </div>
        )}
      </section>

      {/* 6. Trending Products */}
      <section className="pt-2">
        <SectionHeader
          title="Trending Products"
          subtitle="Most popular this week"
          seeAllLink="/products?sort=trending"
        />
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-72 rounded-xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : trending.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {trending.map((prod) => (
              <ProductCard key={prod._id || prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
            <Cpu className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              Loading components from catalog...
            </p>
          </div>
        )}
      </section>

      {/* 7. Build Your Project / Configurator CTA Banner */}
      <Link
        href="/projects"
        className="block group rounded-2xl p-4 transition-all border shadow-sm hover:shadow-md"
        style={{
          backgroundColor: '#F9731612',
          borderColor: '#F9731630',
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"
            >
              <Wrench className="w-5 h-5" style={{ color: BRAND.orange }} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Build Your Project</h4>
              <p className="text-xs text-slate-500">
                Step-by-step complete project configurator & hardware kits
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 shrink-0" style={{ color: BRAND.orange }} />
        </div>
      </Link>

      {/* 8. Recommended for You */}
      <section className="pt-2">
        <SectionHeader
          title="Recommended for You"
          subtitle="Based on your interests"
          seeAllLink="/products?sort=recommended"
        />
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-72 rounded-xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {(recommended.length > 0 ? recommended : trending).slice(0, 8).map((prod) => (
              <ProductCard key={prod._id || prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
