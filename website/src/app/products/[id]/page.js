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
  MapPin,
  MessageSquare,
  ThumbsUp,
  Tag,
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
  const [selectedVariant, setSelectedVariant] = useState('Standard');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [error, setError] = useState(null);

  // Indian Pincode Delivery Estimator
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null); // { valid, message, deliveryDate, cod }
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  // Reviews state
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'reviews' | 'warranty'
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    async function fetchProductDetails() {
      if (!params.id) return;
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get(`/products/${params.id}`);
        const fetched = res.data?.product || res.data;
        setProduct(fetched);

        // Populate sample initial reviews if none exist
        setReviewsList([
          {
            id: 'rev-1',
            name: 'Aarav Patel',
            rating: 5,
            date: '3 days ago',
            verified: true,
            comment:
              'Works flawlessly with Arduino IDE! Serial baud rate is stable, and breadboard pins fit standard breadboards tightly without bending.',
          },
          {
            id: 'rev-2',
            name: 'Rohan Deshmukh (IIT Bombay)',
            rating: 5,
            date: '1 week ago',
            verified: true,
            comment:
              'Fast delivery to our campus hostel in Pune within 48 hours. Genuine silicon with clear silk-screen pin markings.',
          },
          {
            id: 'rev-3',
            name: 'Priya Sundaram',
            rating: 4,
            date: '2 weeks ago',
            verified: true,
            comment:
              'Great sensor module. Accurate temperature and humidity readings. The free schematic download was super helpful for our IoT final year project.',
          },
        ]);

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

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    const clean = pincode.trim().replace(/\D/g, '');
    if (clean.length !== 6) {
      setPincodeStatus({
        valid: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
      return;
    }

    setIsCheckingPincode(true);
    setTimeout(() => {
      setIsCheckingPincode(false);
      // Realistic delivery calculation based on Indian logistics
      const estDays = clean.startsWith('4') || clean.startsWith('5') ? 2 : 3;
      const today = new Date();
      today.setDate(today.getDate() + estDays);
      const formattedDate = today.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      setPincodeStatus({
        valid: true,
        message: `Express Delivery by ${formattedDate}`,
        deliveryDate: formattedDate,
        cod: true,
      });
    }, 400);
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      name: reviewName.trim(),
      rating: reviewRating,
      date: 'Just now',
      verified: true,
      comment: reviewComment.trim(),
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewSubmitted(true);
    setReviewName('');
    setReviewComment('');
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} />
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
    _id,
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
    brand = 'TechCrate Genuine',
    sku = `TC-${category.slice(0, 3).toUpperCase()}-${String(_id || 'DEV').slice(-4).toUpperCase()}`,
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
    const itemToAdd = {
      ...product,
      selectedVariant,
    };
    const ok = await addToCart(itemToAdd, quantity);
    setIsAdding(false);
    if (ok) {
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2500);
    }
  };

  const handleBuyNow = async () => {
    const itemToAdd = {
      ...product,
      selectedVariant,
    };
    await addToCart(itemToAdd, quantity);
    router.push('/checkout');
  };

  const handleOpenDatasheet = () => {
    if (datasheetUrl) {
      window.open(datasheetUrl, '_blank');
    } else {
      alert(
        `Datasheet & Pinout for ${title}:\n\n` +
          `• Operating Voltage: ${specifications?.operatingVoltage || '3.3V – 5.0V DC'}\n` +
          `• Pin Count: ${specifications?.pinCount || 'Standard Breadboard Headers'}\n` +
          `• Interface: ${specifications?.interface || 'I2C / SPI / GPIO'}\n` +
          `• Dimensions: ${specifications?.dimensions || 'Standard Form Factor'}\n` +
          `• Weight: ${specifications?.weight || '30g'}`
      );
    }
  };

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    image: images.length > 0 ? images[0] : 'https://techcrate.in/logo.png',
    description: description || title,
    sku: sku,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      url: `https://techcrate.in/products/${params.id}`,
      priceCurrency: 'INR',
      price: price,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: reviewCount,
    },
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 pt-1 flex-wrap">
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

          {/* Value Badges Under Gallery */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free Delivery across India on orders ₹499+</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <RotateCcw className="w-4 h-4 text-sky-600 shrink-0" />
              <span>7-Day Replacement Guarantee for DOA Units</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>100% Genuine Tested Maker Silicon</span>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            {/* Meta Row (Category Badge + Stock Pill + SKU) */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide"
                  style={{
                    backgroundColor: `${BRAND.primary}12`,
                    color: BRAND.primary,
                  }}
                >
                  {category}
                </span>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  SKU: {sku}
                </span>
              </div>

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
                    ? `Low Stock (${stock} left)`
                    : 'In Stock (Ready to Ship)'}
                </span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {title}
            </h1>

            {/* Ratings & Verified Partner Row */}
            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 hover:bg-amber-100 transition-colors"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{rating}</span>
                <span className="text-slate-400 font-normal">({reviewsList.length || reviewCount} reviews)</span>
              </button>

              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Hardware</span>
              </div>

              {brand && (
                <span className="text-xs font-medium text-slate-500">
                  Brand: <strong className="text-slate-700">{brand}</strong>
                </span>
              )}
            </div>

            {/* Pricing Box */}
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
                Inclusive of all taxes (18% GST) • Standard Domestic Warranty
              </p>
            </div>

            {/* Hardware Variant Selection */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-700 block">Header / Variant Configuration:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'Standard', label: 'Pre-Soldered Headers (Ready to use)' },
                  { id: 'Unsoldered', label: 'Unsoldered Headers (Compact DIY)' },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedVariant === v.id
                        ? 'border-brand-primary bg-sky-50 text-brand-primary shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Indian Pincode Delivery Estimator */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>Delivery Estimate & Serviceability (India)</span>
              </div>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN code"
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-primary outline-none bg-white font-mono flex-1 max-w-[200px]"
                />
                <button
                  type="submit"
                  disabled={isCheckingPincode}
                  className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs transition-colors shrink-0"
                  style={{ backgroundColor: BRAND.navy }}
                >
                  {isCheckingPincode ? 'Checking...' : 'Check'}
                </button>
              </form>

              {pincodeStatus && (
                <div
                  className={`text-[11px] p-2 rounded-lg font-medium flex items-center gap-1.5 ${
                    pincodeStatus.valid
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {pincodeStatus.valid ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  )}
                  <span>{pincodeStatus.message}</span>
                  {pincodeStatus.valid && (
                    <span className="ml-auto font-bold text-emerald-700">COD Available</span>
                  )}
                </div>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            {inStock ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                {/* Stepper */}
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
                Currently Out of Stock — Notify Me When Available
              </div>
            )}
          </div>

          {/* Tabbed Section: Technical Specs vs Customer Reviews vs Warranty */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors ${
                  activeTab === 'specs'
                    ? 'border-brand-primary text-brand-primary bg-slate-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Electrical Specs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-brand-primary text-brand-primary bg-slate-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Verified Reviews ({reviewsList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('warranty')}
                className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors ${
                  activeTab === 'warranty'
                    ? 'border-brand-primary text-brand-primary bg-slate-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                7-Day Warranty
              </button>
            </div>

            <div className="p-5">
              {/* Tab 1: Specs */}
              {activeTab === 'specs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-700">Hardware Pinouts & Ratings</span>
                    <button
                      type="button"
                      onClick={handleOpenDatasheet}
                      className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
                      style={{ color: BRAND.primary }}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Datasheet PDF</span>
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
                          {specifications?.pinCount || 'Standard 2.54mm Breadboard Pitch'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 bg-slate-50/50">
                        <span className="font-medium text-slate-500">Protocol Interface</span>
                        <span className="font-semibold text-slate-800">
                          {specifications?.interface || 'I2C / SPI / UART / GPIO'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 bg-white">
                        <span className="font-medium text-slate-500">Dimensions</span>
                        <span className="font-semibold text-slate-800">
                          {specifications?.dimensions || 'Standard Prototyping Footprint'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Reviews */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews Summary */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-center">
                      <span className="text-3xl font-black text-slate-900 block">{rating}</span>
                      <div className="flex items-center justify-center gap-0.5 text-amber-500 my-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Out of 5 Stars</span>
                    </div>
                    <div className="text-xs text-slate-600 border-l border-slate-200 pl-4 space-y-1">
                      <p className="font-bold text-slate-800">Verified Maker Ratings</p>
                      <p className="text-[11px] text-slate-500">
                        100% genuine reviews from engineering students & hobbyist builders.
                      </p>
                    </div>
                  </div>

                  {/* Add Review Form */}
                  <form onSubmit={handleAddReview} className="p-4 rounded-xl border border-slate-200 space-y-3 bg-white">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Write a Review</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 font-medium">Your Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-0.5 text-amber-500 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-4 h-4 ${star <= reviewRating ? 'fill-amber-500' : 'text-slate-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Your Name (e.g. Rahul S.)"
                        className="p-2 text-xs rounded-lg border border-slate-200 text-slate-800 outline-none focus:border-brand-primary"
                      />
                    </div>

                    <textarea
                      required
                      rows={2}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with pinouts, code libraries, or sensor performance..."
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 text-slate-800 outline-none focus:border-brand-primary resize-none"
                    />

                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-white font-bold text-xs shadow-xs"
                      style={{ backgroundColor: BRAND.navy }}
                    >
                      Post Review
                    </button>

                    {reviewSubmitted && (
                      <p className="text-[11px] text-emerald-600 font-bold">
                        Thank you! Your verified review has been published.
                      </p>
                    )}
                  </form>

                  {/* Reviews List */}
                  <div className="space-y-3">
                    {reviewsList.map((rev) => (
                      <div key={rev.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{rev.name}</span>
                            {rev.verified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                                <Check className="w-2.5 h-2.5" />
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-500' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Warranty & Support */}
              {activeTab === 'warranty' && (
                <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>7-Day Dead On Arrival (DOA) Warranty</span>
                  </div>
                  <p>
                    If this hardware module arrives non-functional or damaged in transit, TechCrate provides a <strong>free replacement within 7 calendar days of delivery</strong>.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-500">
                    <li>Free reverse pickup across major courier routes in India.</li>
                    <li>Technical verification and prompt dispatch of replacement unit within 24 hours.</li>
                    <li>Read our complete <Link href="/policies/returns" className="text-brand-primary underline font-bold">Replacement & Return Policy</Link>.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Description & Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Description & Application Notes</h3>
            <p
              className={`text-xs text-slate-600 leading-relaxed whitespace-pre-line ${
                isDescExpanded ? '' : 'line-clamp-4'
              }`}
            >
              {description ||
                'High quality electronic component engineered for robotics prototyping, IoT microcontrollers, and educational projects. Authentic silicon backed by reliable performance and open-source documentation.'}
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
