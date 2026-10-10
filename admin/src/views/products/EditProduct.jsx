'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Cpu,
  Archive,
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

export default function EditProduct() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [error, setError] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Microcontrollers');
  const [stock, setStock] = useState(25);
  const [description, setDescription] = useState('');
  const [datasheetUrl, setDatasheetUrl] = useState('');
  const [isArchived, setIsArchived] = useState(false);

  // Hardware Specifications State
  const [specifications, setSpecifications] = useState({
    operatingVoltage: '5V DC',
    pinCount: 'N/A',
    interface: 'I2C / SPI / GPIO',
    dimensions: '',
    weight: '',
  });

  // Pricing State: Price & Discounted Price
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');

  // Features State (Array of feature bullet points)
  const [features, setFeatures] = useState([]);
  const [newFeatureInput, setNewFeatureInput] = useState('');

  // 4 Images per product
  const [images, setImages] = useState(['', '', '', '']);

  const fileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      if (data) {
        setTitle(data.title || '');
        setSku(data.sku || '');
        setCategory(data.category || 'Microcontrollers');
        setStock(data.stock !== undefined ? data.stock : 25);
        setDescription(data.description || '');
        setDatasheetUrl(data.datasheetUrl || '');
        setIsArchived(Boolean(data.isArchived));
        setOriginalPrice(data.originalPrice || data.price || '');
        setDiscountedPrice(data.discountedPrice || (data.originalPrice && data.price < data.originalPrice ? data.price : ''));
        setFeatures(Array.isArray(data.features) ? data.features : []);
        setSpecifications({
          operatingVoltage: data.specifications?.operatingVoltage || '5V DC',
          pinCount: data.specifications?.pinCount || 'N/A',
          interface: data.specifications?.interface || 'I2C / SPI / GPIO',
          dimensions: data.specifications?.dimensions || '',
          weight: data.specifications?.weight || '',
        });

        const imgs = Array.isArray(data.images) ? [...data.images] : [];
        while (imgs.length < 4) imgs.push('');
        setImages(imgs.slice(0, 4));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

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
      setError('Failed to upload image.');
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

  const handleAddFeature = () => {
    if (newFeatureInput.trim()) {
      setFeatures((prev) => [...prev, newFeatureInput.trim()]);
      setNewFeatureInput('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const origNum = Number(originalPrice) || 0;
  const discNum = Number(discountedPrice) || 0;
  const discountPercent =
    origNum > 0 && discNum > 0 && origNum > discNum
      ? Math.round(((origNum - discNum) / origNum) * 100)
      : null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and Description are required.');
      return;
    }

    setIsSaving(true);
    try {
      const validImages = images.map((img) => img.trim()).filter(Boolean);
      const effectiveSellingPrice = discNum > 0 ? discNum : origNum;

      await productService.updateProduct(id, {
        title: title.trim(),
        description: description.trim(),
        category,
        stock: Number(stock) || 0,
        originalPrice: origNum,
        discountedPrice: discNum > 0 ? discNum : origNum,
        price: effectiveSellingPrice,
        discountPercentage: discountPercent || 0,
        features: features.filter((f) => f.trim().length > 0),
        images: validImages.slice(0, 4),
        sku: sku.trim() || undefined,
        datasheetUrl: datasheetUrl.trim() || '',
        isArchived,
        status: isArchived ? 'archived' : 'active',
        specifications,
      });

      router.push('/products');
    } catch (err) {
      console.error('[Update Error]', err);
      setError(err.response?.data?.message || err.message || 'Error updating product.');
    } finally {
      setIsSaving(false);
    }
  };

  const slotLabels = [
    { title: 'Image 1 (Main Cover)', desc: 'Primary thumbnail on catalog & search' },
    { title: 'Image 2 (Detail View)', desc: 'Top view / angle board inspection' },
    { title: 'Image 3 (Pinout / Diagram)', desc: 'GPIO pinout & wiring diagram' },
    { title: 'Image 4 (In-Hand / Package)', desc: 'Close-up texture & kit packaging' },
  ];

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => router.push('/products')}
        className="flex items-center gap-2 text-xs text-cyan-400 font-semibold hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Edit Hardware Component</h1>
        <p className="text-xs text-slate-400 mt-1">Update title, description, features, pricing, and 4 images.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Details Card */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            1. Basic Component Information
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category *</label>
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
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                SKU / Part Number
              </label>
              <input
                type="text"
                placeholder="e.g. TC-ESP32-DEV"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Datasheet PDF Link (URL)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={datasheetUrl}
                onChange={(e) => setDatasheetUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Catalog Status
            </label>
            <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                <input
                  type="radio"
                  name="archiveStatus"
                  checked={!isArchived}
                  onChange={() => setIsArchived(false)}
                  className="text-cyan-500 focus:ring-cyan-500"
                />
                <span className="font-semibold text-emerald-400">Active (Visible on Customer Storefront)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-white ml-4">
                <input
                  type="radio"
                  name="archiveStatus"
                  checked={isArchived}
                  onChange={() => setIsArchived(true)}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span className="font-semibold text-amber-400">Archived (De-listed from Storefront)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Pricing Card */}
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
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Discounted Price (₹)
              </label>
              <input
                type="number"
                min="0"
                value={discountedPrice}
                onChange={(e) => setDiscountedPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Hardware Specifications Card */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" /> 3. Hardware Technical Specifications
            </h3>
            <span className="text-xs text-slate-400">Maker & engineering parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Operating Voltage
              </label>
              <input
                type="text"
                placeholder="e.g. 3.3V - 5V DC"
                value={specifications.operatingVoltage}
                onChange={(e) =>
                  setSpecifications((prev) => ({ ...prev, operatingVoltage: e.target.value }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Pin Count / Header
              </label>
              <input
                type="text"
                placeholder="e.g. 30 Pins (2x15)"
                value={specifications.pinCount}
                onChange={(e) =>
                  setSpecifications((prev) => ({ ...prev, pinCount: e.target.value }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Bus / Interface
              </label>
              <input
                type="text"
                placeholder="e.g. I2C / SPI / UART / PWM"
                value={specifications.interface}
                onChange={(e) =>
                  setSpecifications((prev) => ({ ...prev, interface: e.target.value }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Board Dimensions
              </label>
              <input
                type="text"
                placeholder="e.g. 51mm x 28mm"
                value={specifications.dimensions}
                onChange={(e) =>
                  setSpecifications((prev) => ({ ...prev, dimensions: e.target.value }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Weight
              </label>
              <input
                type="text"
                placeholder="e.g. 12g"
                value={specifications.weight}
                onChange={(e) =>
                  setSpecifications((prev) => ({ ...prev, weight: e.target.value }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Features / Highlights Card */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" /> 4. Key Product Features & Highlights
            </h3>
            <span className="text-xs text-slate-400 font-mono">{features.length} Features</span>
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

        {/* 4 Images per product Card */}
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

        {/* Save Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
        >
          {isSaving ? 'Updating Product...' : (
            <>
              <Save className="w-5 h-5" /> Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}
