'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Check,
  ChevronRight,
  Minus,
  Plus,
  Loader2,
  AlertCircle,
  FileText,
  ExternalLink,
  Cpu,
  Layers,
  CheckCircle,
} from 'lucide-react';
import ImageGallery from '@/components/ImageGallery';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProductDetails() {
      if (!params.id) return;
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get(`/products/${params.id}`);
        const fetched = res.data?.product || res.data;
        setProduct(fetched);

        // Fetch related items in same category
        if (fetched?.category) {
          try {
            const relRes = await api.get(
              `/products?category=${encodeURIComponent(fetched.category)}&limit=5`
            );
            const items = Array.isArray(relRes.data)
              ? relRes.data
              : relRes.data.products || [];
            setRelatedProducts(items.filter((p) => p._id !== params.id).slice(0, 4));
          } catch {
            // Ignore related error
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        setError('Product not found or unavailable.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductDetails();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" style={{ color: BRAND.primary }} />
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Loading hardware specifications...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm my-8">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Component Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          This hardware item may be unavailable or out of stock.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm"
          style={{ backgroundColor: BRAND.navy }}
        >
          Browse All Hardware
        </Link>
      </div>
    );
  }

  const {
    title,
    description,
    price = 0,
    originalPrice = 0,
    category = 'Hardware',
    images = [],
    stock = 10,
    features = [],
    specifications = {},
    rating = 4.8,
    reviewCount = 38,
    brand,
    sku,
    datasheetUrl,
  } = product;

  const inStock = stock > 0;
  const isLowStock = stock > 0 && stock <= 5;
  const hasDiscount = originalPrice > price;
  const discountPercent =
    product.discountPercentage ||
    (hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
  const savingsAmount = hasDiscount ? originalPrice - price : 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    const ok = await addToCart(product, quantity);
    setIsAdding(false);
    if (ok) {
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2500);
    }
  };

  const handleBuyNow = async () => {
    await addToCart(product, quantity);
    router.push('/checkout');
  };

  const handleOpenDatasheet = () => {
    if (datasheetUrl) {
      window.open(datasheetUrl, '_blank');
    } else {
      alert(
        `Datasheet & Pinout for ${title}:\n\n` +
          `• Operating Voltage: ${specifications?.operatingVoltage || '5V DC'}\n` +
          `• Pin Count: ${specifications?.pinCount || 'Standard DIP/SMD'}\n` +
          `• Interface: ${specifications?.interface || 'I2C / SPI / GPIO'}\n` +
          `• Dimensions: ${specifications?.dimensions || 'Standard Form Factor'}\n` +
          `• Weight: ${specifications?.weight || '30g'}`
      );
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link href="/products" className="hover:text-slate-900 transition-colors">
          Products
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link
          href={`/products?category=${encodeURIComponent(category)}`}
          className="hover:text-slate-900 transition-colors"
        >
          {category}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-800 font-bold truncate max-w-xs">{title}</span>
      </nav>

      {/* Main Product Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Image Showcase (5 cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <ImageGallery
            images={images}
            title={title}
            discountPercent={discountPercent}
            isLowStock={isLowStock}
            stock={stock}
          />
        </div>

        {/* Right Column: Details & Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Details Card (Matches Mobile detailsCard) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            {/* Meta Row (Category Badge + Stock Pill) */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide"
                style={{
                  backgroundColor: `${BRAND.primary}12`,
                  color: BRAND.primary,
                }}
              >
                {category}
              </span>

              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  !inStock
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : isLowStock
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    !inStock
                      ? 'bg-rose-500'
                      : isLowStock
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-emerald-500'
                  }`}
                />
                <span>
                  {!inStock
                    ? 'Out of Stock'
                    : isLowStock
                    ? `Low Stock (${stock})`
                    : 'In Stock'}
                </span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {title}
            </h1>

            {/* Ratings & Verified Partner Row */}
            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{rating}</span>
                <span className="text-slate-400 font-normal">({reviewCount} reviews)</span>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Partner</span>
              </div>

              {brand && (
                <span className="text-xs font-medium text-slate-500">
                  Brand: <strong className="text-slate-700">{brand}</strong>
                </span>
              )}
            </div>

            {/* Pricing Box (Matches Mobile priceContainer) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
              <div className="flex items-baseline gap-2.5">
                <span className="text-xs font-bold text-slate-500">₹</span>
                <span
                  className="text-3xl font-black tracking-tight"
                  style={{ color: BRAND.navy }}
                >
                  {Number(price).toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-sm font-semibold text-slate-400 line-through">
                    ₹{Number(originalPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {hasDiscount && savingsAmount > 0 && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold text-emerald-700 bg-emerald-100/60 w-fit">
                  <span>
                    You Save ₹{Number(savingsAmount).toLocaleString('en-IN')} ({discountPercent}%)
                  </span>
                </div>
              )}

              <p className="text-[11px] text-slate-500 mt-0.5">
                Inclusive of all taxes (GST) • 100% Genuine Maker Component
              </p>
            </div>

            {/* Value Propositions / Guarantees Strip (Matches Mobile guaranteeStrip) */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 py-3 border-y border-slate-100 text-center">
              <div className="flex flex-col items-center px-1">
                <Truck className="w-4 h-4 mb-1" style={{ color: BRAND.navy }} />
                <span className="text-xs font-bold text-slate-800">Fast Dispatch</span>
                <span className="text-[10px] text-slate-500">Within 24 Hours</span>
              </div>
              <div className="flex flex-col items-center px-1">
                <ShieldCheck className="w-4 h-4 mb-1 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">100% Genuine</span>
                <span className="text-[10px] text-slate-500">Tested Hardware</span>
              </div>
              <div className="flex flex-col items-center px-1">
                <RotateCcw className="w-4 h-4 mb-1" style={{ color: BRAND.navy }} />
                <span className="text-xs font-bold text-slate-800">7-Day Warranty</span>
                <span className="text-[10px] text-slate-500">Easy Replacement</span>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            {inStock ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                {/* Quantity Stepper (Matches Mobile qtyControl) */}
                <div className="flex items-center justify-between border border-slate-200 rounded-xl bg-slate-50 px-2 py-1 w-fit self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-900 select-none min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    disabled={quantity >= stock}
                    className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm ${
                    addSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'border text-slate-800 hover:bg-slate-50 active:scale-95'
                  }`}
                  style={{
                    backgroundColor: addSuccess ? undefined : '#F1F5F9',
                    color: addSuccess ? '#FFFFFF' : BRAND.navy,
                    borderColor: '#E2E8F0',
                  }}
                >
                  {addSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                {/* Buy Now Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-sm active:scale-95 transition-all"
                  style={{ backgroundColor: BRAND.primary }}
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now</span>
                </button>
              </div>
            ) : (
              <div className="py-3 px-4 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs text-center border border-rose-200">
                Currently Out of Stock
              </div>
            )}
          </div>

          {/* Technical & Electrical Specifications Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: BRAND.navy }} />
                <h3 className="text-sm font-bold text-slate-900">Electrical & Tech Specs</h3>
              </div>
              <button
                type="button"
                onClick={handleOpenDatasheet}
                className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                style={{ color: BRAND.primary }}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Datasheet</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-2 p-2.5 bg-slate-50/50">
                  <span className="font-medium text-slate-500">Operating Voltage</span>
                  <span className="font-semibold text-slate-800">
                    {specifications?.operatingVoltage || '3.3V – 5.0V DC'}
                  </span>
                </div>
                <div className="grid grid-cols-2 p-2.5 bg-white">
                  <span className="font-medium text-slate-500">Pin Configuration</span>
                  <span className="font-semibold text-slate-800">
                    {specifications?.pinCount || 'Standard Breadboard Headers'}
                  </span>
                </div>
                <div className="grid grid-cols-2 p-2.5 bg-slate-50/50">
                  <span className="font-medium text-slate-500">Communication Protocol</span>
                  <span className="font-semibold text-slate-800">
                    {specifications?.interface || 'I2C / SPI / UART / GPIO'}
                  </span>
                </div>
                <div className="grid grid-cols-2 p-2.5 bg-white">
                  <span className="font-medium text-slate-500">Category Type</span>
                  <span className="font-semibold text-slate-800">{category}</span>
                </div>
                {specifications?.dimensions && (
                  <div className="grid grid-cols-2 p-2.5 bg-slate-50/50">
                    <span className="font-medium text-slate-500">Dimensions</span>
                    <span className="font-semibold text-slate-800">
                      {specifications.dimensions}
                    </span>
                  </div>
                )}
                {specifications?.weight && (
                  <div className="grid grid-cols-2 p-2.5 bg-white">
                    <span className="font-medium text-slate-500">Net Weight</span>
                    <span className="font-semibold text-slate-800">
                      {specifications.weight}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compatibility Verified Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4" style={{ color: BRAND.navy }} />
              <h3 className="text-sm font-bold text-slate-900">Compatibility Verified With</h3>
            </div>
            <p className="text-xs text-slate-500">
              Pre-tested with standard prototyping microcontrollers & dev boards:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                'Arduino Uno & Nano',
                'ESP32 & ESP8266',
                'Raspberry Pi 4 / 5',
                'STM32 BluePill',
                'Solderless Breadboard',
              ].map((tag, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/70"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Features & Highlights */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" style={{ color: BRAND.navy }} />
              <h3 className="text-sm font-bold text-slate-900">Key Features & Highlights</h3>
            </div>
            <div className="space-y-2">
              {(features && features.length > 0
                ? features
                : [
                    'Factory calibrated with high precision output',
                    'Breadboard friendly 2.54mm pitch terminal pins',
                    'Low power consumption, ideal for battery-operated IoT nodes',
                    'Robust ESD protection and reverse polarity tolerance',
                    'Full open-source code libraries and schematics available',
                  ]
              ).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Overview & Pinout Details */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Description & Pinout Details</h3>
            <p
              className={`text-xs text-slate-600 leading-relaxed whitespace-pre-line ${
                isDescExpanded ? '' : 'line-clamp-4'
              }`}
            >
              {description ||
                'High quality hardware module designed for hobbyists, engineers, and educational robotics. Provides accurate performance with easy interfacing for microcontrollers.'}
            </p>
            {description && description.length > 180 && (
              <button
                type="button"
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-xs font-bold hover:underline inline-flex items-center gap-1 mt-1"
                style={{ color: BRAND.primary }}
              >
                <span>{isDescExpanded ? 'Show Less' : 'Read Full Description'}</span>
                <ChevronRight
                  className={`w-3 h-3 transition-transform ${
                    isDescExpanded ? '-rotate-90' : 'rotate-90'
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Frequently Bought Together / Related Hardware */}
      {relatedProducts.length > 0 && (
        <section className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Frequently Bought Together
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Complementary modules and components for your circuit setup
              </p>
            </div>
            <Link
              href={`/products?category=${encodeURIComponent(category)}`}
              className="text-xs font-bold hover:underline inline-flex items-center gap-0.5"
              style={{ color: BRAND.navy }}
            >
              <span>See all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id || rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
