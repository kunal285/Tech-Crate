import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Tag,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { productService } from '../../services/productService';
import api from '../../services/api';

const CATEGORIES = [
  'Microcontrollers',
  'Sensors',
  'Motors & Drivers',
  'Wireless & IoT',
  'Power & Battery',
  'Displays',
  'Components & Passives',
  'Project Kits',
  'Tools & Prototyping',
];

export default function AddProduct() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [error, setError] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Microcontrollers');
  const [stock, setStock] = useState(25);
  const [description, setDescription] = useState('');

  // Pricing State: Price & Discounted Price
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');

  // Features State (Array of feature bullet points)
  const [features, setFeatures] = useState([
    'High-performance microcontroller board for IoT & robotics',
    'Integrated 2.4 GHz Wi-Fi and Bluetooth connectivity',
    '30 GPIO pins supporting ADC, DAC, PWM, I2C, SPI & UART',
    'Operating Voltage: 3.3V / 5V DC compatible with Arduino IDE',
  ]);
  const [newFeatureInput, setNewFeatureInput] = useState('');

  // 4 Images per product
  const [images, setImages] = useState([
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
  ]);

  const fileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Image Upload handler for specific slot (0, 1, 2, 3)
  const handleImageUpload = async (slotIndex, file) => {
    if (!file) return;
    setUploadingSlot(slotIndex);
    setError(null);
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      uploadData.append('folder', 'products');

      const res = await api.post('/upload/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.url) {
        setImages((prev) => {
          const updated = [...prev];
          updated[slotIndex] = res.data.url;
          return updated;
        });
      }
    } catch (err) {
      console.error('[Upload Error]', err);
      setError(err.response?.data?.message || 'Failed to upload image. You can also paste an image URL directly.');
    } finally {
      setUploadingSlot(null);
    }
  };

  const updateImageUrl = (slotIndex, url) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[slotIndex] = url;
      return updated;
    });
  };

  // Add Feature item
  const handleAddFeature = () => {
    if (newFeatureInput.trim()) {
      setFeatures((prev) => [...prev, newFeatureInput.trim()]);
      setNewFeatureInput('');
    }
  };

  // Remove Feature item
  const handleRemoveFeature = (index) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate discount %
  const origNum = Number(originalPrice) || 0;
  const discNum = Number(discountedPrice) || 0;
  const discountPercent =
    origNum > 0 && discNum > 0 && origNum > discNum
      ? Math.round(((origNum - discNum) / origNum) * 100)
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Product title is required.');
      return;
    }

    if (!description.trim()) {
      setError('Product description is required.');
      return;
    }

    if (!originalPrice || origNum <= 0) {
      setError('Please provide a valid regular price.');
      return;
    }

    // Filter valid image URLs
    const validImages = images.map((img) => img.trim()).filter(Boolean);
    if (validImages.length === 0) {
      setError('Please provide at least 1 image for the product (up to 4 images).');
      return;
    }

    setIsSubmitting(true);
    try {
      const effectiveSellingPrice = discNum > 0 ? discNum : origNum;

      await productService.createProduct({
        title: title.trim(),
        description: description.trim(),
        category,
        stock: Number(stock) || 10,
        originalPrice: origNum,
        discountedPrice: discNum > 0 ? discNum : origNum,
        price: effectiveSellingPrice,
        discountPercentage: discountPercent || 0,
        features: features.filter((f) => f.trim().length > 0),
        images: validImages.slice(0, 4),
      });

      navigate('/products');
    } catch (err) {
      console.error('[Create Product Error]', err);
      setError(err.response?.data?.message || err.message || 'Error creating product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const slotLabels = [
    { title: 'Image 1 (Main Cover)', desc: 'Primary thumbnail on catalog & search' },
    { title: 'Image 2 (Detail View)', desc: 'Top view / angle board inspection' },
    { title: 'Image 3 (Pinout / Diagram)', desc: 'GPIO pinout & wiring diagram' },
    { title: 'Image 4 (In-Hand / Package)', desc: 'Close-up texture & kit packaging' },
  ];

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-2 text-xs text-cyan-400 font-semibold hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Component Catalog
      </button>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Add New Hardware Product</h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete listing details with title, description, features, pricing & 4 product gallery images.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details Card */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            1. Basic Component Information
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ESP32 NodeMCU Wi-Fi + Bluetooth Dev Board (WROOM-32)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="25"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide a comprehensive technical description of the component, operating parameters, and typical engineering applications..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Pricing Card: Price and Discounted Price */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Price & Discounted Price
            </h3>
            {discountPercent !== null && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
                {discountPercent}% OFF • Save ₹{origNum - discNum}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Regular Price / MRP (₹) *
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="e.g. 499"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Strikethrough base price / MRP</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Discounted Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 349 (leave empty if no discount)"
                value={discountedPrice}
                onChange={(e) => setDiscountedPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Actual price customer pays at checkout</p>
            </div>
          </div>
        </div>

        {/* Features / Highlights Card */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" /> 3. Key Product Features & Highlights
            </h3>
            <span className="text-xs text-slate-400 font-mono">{features.length} Features Added</span>
          </div>

          <div className="space-y-2">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl group"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-cyan-950 border border-cyan-800/60 text-cyan-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-slate-200 truncate">{feat}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  title="Remove feature"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Feature input */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Type a key feature / specification bullet point..."
              value={newFeatureInput}
              onChange={(e) => setNewFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* 4 Images Per Product Card */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-400" /> 4. Product Gallery (4 Images)
            </h3>
            <span className="text-xs text-slate-400">Slots 1 to 4</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slotLabels.map((slot, index) => (
              <div
                key={index}
                className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{slot.title}</h4>
                    <p className="text-[10px] text-slate-400">{slot.desc}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold">
                    #{index + 1}
                  </span>
                </div>

                {/* Thumbnail Preview */}
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center relative group">
                  {images[index] ? (
                    <img
                      src={images[index]}
                      alt={slot.title}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  ) : (
                    <div className="text-center text-slate-600 text-xs flex flex-col items-center gap-1">
                      <ImageIcon className="w-6 h-6" />
                      <span>No image selected</span>
                    </div>
                  )}
                </div>

                {/* Upload & URL Input */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRefs[index]}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(index, e.target.files?.[0])}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs[index].current?.click()}
                      disabled={uploadingSlot === index}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      {uploadingSlot === index ? 'Uploading...' : 'Upload Image'}
                    </button>
                    {images[index] && (
                      <button
                        type="button"
                        onClick={() => updateImageUrl(index, '')}
                        className="p-2 text-slate-400 hover:text-rose-400 rounded-lg bg-slate-900 border border-slate-800"
                        title="Clear image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Or paste direct image URL (https://...)"
                    value={images[index]}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
        >
          {isSubmitting ? (
            'Publishing Hardware Listing...'
          ) : (
            <>
              <Plus className="w-5 h-5" /> Publish Hardware Component Listing
            </>
          )}
        </button>
      </form>
    </div>
  );
}
