'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Cpu, ArrowUpDown, X, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { CATEGORIES } from '@/lib/constants';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialKeyword = searchParams.get('keyword') || searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialPage = Number(searchParams.get('page')) || 1;

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialKeyword);
  const [sortBy, setSortBy] = useState(initialSort);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('category') || 'All';
    const kw = searchParams.get('keyword') || searchParams.get('q') || '';
    const pg = Number(searchParams.get('page')) || 1;
    setSelectedCategory(cat);
    setSearchQuery(kw);
    setCurrentPage(pg);
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        let url = `/products?page=${currentPage}&limit=16`;
        if (selectedCategory && selectedCategory !== 'All') {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }
        if (searchQuery.trim()) {
          url += `&keyword=${encodeURIComponent(searchQuery.trim())}`;
        }

        const res = await api.get(url);
        const data = res.data;

        let list = [];
        if (Array.isArray(data)) {
          list = data;
          setTotalProducts(data.length);
          setTotalPages(Math.ceil(data.length / 16) || 1);
        } else if (data.products) {
          list = data.products;
          setTotalProducts(data.total || data.products.length);
          setTotalPages(data.pages || 1);
        }

        // Apply in-memory sort if needed
        if (sortBy === 'price_asc') {
          list.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === 'price_desc') {
          list.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortBy === 'rating') {
          list.sort((a, b) => ((b.rating || 4.5) - (a.rating || 4.5)));
        }

        if (inStockOnly) {
          list = list.filter((p) => (p.stock || 0) > 0);
        }

        setProducts(list);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, searchQuery, currentPage, sortBy, inStockOnly]);

  const updateUrl = (cat, query, page) => {
    const params = new URLSearchParams();
    if (cat && cat !== 'All') params.set('category', cat);
    if (query && query.trim()) params.set('keyword', query.trim());
    if (page > 1) params.set('page', page);
    router.push(`/products?${params.toString()}`);
  };

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    setCurrentPage(1);
    updateUrl(catName, searchQuery, 1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateUrl(selectedCategory, searchQuery, 1);
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('newest');
    setInStockOnly(false);
    setCurrentPage(1);
    router.push('/products');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: BRAND.navy }}
          >
            Electronics Components & Hardware
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Browse microcontrollers, robotics shields, sensor modules, and prototyping essentials.
          </p>
        </div>

        {/* Catalog Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search part, SKU, ESP32..."
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-white border border-slate-200 focus:border-brand-primary text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                updateUrl(selectedCategory, '', 1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 min-w-0">
        {/* Horizontal Category Pill Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar min-w-0 flex-1">
          <button
            onClick={() => handleCategorySelect('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-[#032762] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
            }`}
            style={{
              backgroundColor: selectedCategory === 'All' ? BRAND.navy : undefined,
            }}
          >
            All Hardware
          </button>
          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#032762] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
              }`}
              style={{
                backgroundColor: selectedCategory === cat.id ? BRAND.navy : undefined,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters (Sort + In-Stock) */}
        <div className="flex items-center gap-2.5 self-end lg:self-auto shrink-0">
          {/* In-Stock Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-brand-primary focus:ring-0"
            />
            <span>In Stock Only</span>
          </label>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-800 outline-none cursor-pointer text-xs"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid Area */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 py-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => {
                  const p = Math.max(1, currentPage - 1);
                  setCurrentPage(p);
                  updateUrl(selectedCategory, searchQuery, p);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-xs"
              >
                Previous
              </button>

              <span className="text-xs font-semibold text-slate-500 px-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => {
                  const p = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(p);
                  updateUrl(selectedCategory, searchQuery, p);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-xs"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-2xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm">
          <Cpu className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">No components matched your search</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Try adjusting your search keywords or switching categories to find what you need.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-xl bg-[#032762] hover:bg-[#034697] text-white text-xs font-bold transition-all shadow-sm"
            style={{ backgroundColor: BRAND.navy }}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" style={{ color: BRAND.primary }} />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
