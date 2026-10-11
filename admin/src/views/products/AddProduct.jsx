'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Cpu,
  Save,
  AlertTriangle,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Checkbox, Switch } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basics');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Microcontrollers');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [datasheetUrl, setDatasheetUrl] = useState('');

  // Specifications
  const [specifications, setSpecifications] = useState({
    operatingVoltage: '',
    pinCount: '',
    interface: '',
    dimensions: '',
    weight: '',
  });

  // Pricing
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');

  // Variants (e.g. Header soldered vs unsoldered)
  const [variants, setVariants] = useState([]);

  // Features List
  const [features, setFeatures] = useState([]);
  const [newFeatureInput, setNewFeatureInput] = useState('');

  // 4 Images per product (empty slots for user upload)
  const [images, setImages] = useState(['', '', '', '']);

  const fileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Unsaved Changes Protection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

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
        setIsDirty(true);
      }
    } catch (err) {
      console.error('[Upload Error]', err);
      setError('Image upload failed. Please verify format (PNG/JPG).');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleAddFeature = () => {
    if (newFeatureInput.trim()) {
      setFeatures([...features, newFeatureInput.trim()]);
      setNewFeatureInput('');
      setIsDirty(true);
    }
  };

  const handleRemoveFeature = (idx) => {
    setFeatures(features.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  const handleAddVariant = () => {
    setVariants([...variants, { name: 'New Variant Option', priceOffset: 0, stock: 10 }]);
    setIsDirty(true);
  };

  const handleRemoveVariant = (idx) => {
    setVariants(variants.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Product title is required.');
      setActiveTab('basics');
      return;
    }
    if (!sku.trim()) {
      setError('Unique SKU code is required.');
      setActiveTab('basics');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const productPayload = {
        title: title.trim(),
        name: title.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        price: Number(discountedPrice || originalPrice),
        originalPrice: Number(originalPrice),
        stock: Number(stock),
        description: description.trim(),
        datasheetUrl: datasheetUrl.trim(),
        features,
        specifications,
        variants,
        images: images.filter(Boolean),
        image: images[0] || '',
      };

      await productService.createProduct(productPayload);
      setIsDirty(false);
      router.push('/products');
    } catch (err) {
      console.error('[Create Product Error]', err);
      setError(err.response?.data?.message || err.message || 'Failed to publish component');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Add Hardware Component"
        subtitle="Publish a new component or DIY maker kit to the catalog"
        icon={Cpu}
        breadcrumbs={[
          { label: 'Products', href: '/products' },
          { label: 'New Product' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/products')}
              icon={ArrowLeft}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isSubmitting}
              onClick={handleSubmit}
              icon={Save}
            >
              Publish SKU
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Section Tabs */}
      <Tabs
        tabs={[
          { id: 'basics', label: '1. Basic Information' },
          { id: 'pricing', label: '2. Pricing & Inventory' },
          { id: 'variants', label: '3. Variant Options' },
          { id: 'images', label: '4. Gallery Images' },
          { id: 'specs', label: '5. Specifications & SEO' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* 1. Basics Tab */}
      {activeTab === 'basics' && (
        <Card className="p-6 space-y-5">
          <Input
            label="Product Title"
            required
            placeholder="e.g. ESP32-WROOM-32D Development Board"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setIsDirty(true);
            }}
            helperText="Clear and descriptive component name"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SKU Identifier"
              required
              placeholder="e.g. TC-ESP32-WROOM"
              value={sku}
              onChange={(e) => {
                setSku(e.target.value);
                setIsDirty(true);
              }}
              helperText="Unique uppercase inventory tracking code"
            />

            <Select
              label="Hardware Category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setIsDirty(true);
              }}
              options={CATEGORIES}
            />
          </div>

          <Textarea
            label="Overview Description"
            rows={4}
            placeholder="Comprehensive description of the component, pin layout, and compatibility..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setIsDirty(true);
            }}
          />
        </Card>
      )}

      {/* 2. Pricing & Inventory Tab */}
      {activeTab === 'pricing' && (
        <Card className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="List Price (MRP) ₹"
              type="number"
              placeholder="599"
              value={originalPrice}
              onChange={(e) => {
                setOriginalPrice(e.target.value);
                setIsDirty(true);
              }}
              helperText="Maximum Retail Price"
            />

            <Input
              label="Offer Price ₹"
              type="number"
              required
              placeholder="449"
              value={discountedPrice}
              onChange={(e) => {
                setDiscountedPrice(e.target.value);
                setIsDirty(true);
              }}
              helperText="Active customer selling price"
            />

            <Input
              label="Stock Quantity"
              type="number"
              required
              placeholder="25"
              value={stock}
              onChange={(e) => {
                setStock(e.target.value);
                setIsDirty(true);
              }}
              helperText="Available inventory units"
            />
          </div>

          <Input
            label="Datasheet Reference URL"
            placeholder="https://espressif.com/documentation/esp32_datasheet.pdf"
            value={datasheetUrl}
            onChange={(e) => {
              setDatasheetUrl(e.target.value);
              setIsDirty(true);
            }}
            helperText="Direct PDF link for maker engineering datasheets"
          />
        </Card>
      )}

      {/* 3. Variants Tab */}
      {activeTab === 'variants' && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Configurable Hardware Variants</h3>
              <p className="text-xs text-slate-500">Provide options such as solder state, header pins, or flash sizes</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleAddVariant} icon={Plus}>
              Add Variant
            </Button>
          </div>

          <div className="space-y-3">
            {variants.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Layers className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                <p className="text-xs text-slate-500">No variant options added yet.</p>
                <p className="text-[11px] text-slate-400">Click &ldquo;Add Variant&rdquo; above if this component offers solder or pin configurations.</p>
              </div>
            ) : (
              variants.map((v, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
                  <input
                    type="text"
                    placeholder="Variant Name"
                    value={v.name}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].name = e.target.value;
                      setVariants(updated);
                      setIsDirty(true);
                    }}
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus-ring"
                  />
                  <input
                    type="number"
                    placeholder="Price Offset (₹)"
                    value={v.priceOffset}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].priceOffset = Number(e.target.value);
                      setVariants(updated);
                      setIsDirty(true);
                    }}
                    className="w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus-ring"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* 4. Images Tab */}
      {activeTab === 'images' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Product Showcase Gallery (4 Slots)</h3>
          <p className="text-xs text-slate-500">Upload high-resolution photography on white background</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {images.map((imgUrl, slotIdx) => (
              <div
                key={slotIdx}
                className="group relative aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-2"
              >
                {imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgUrl}
                    alt={`Slot ${slotIdx + 1}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center space-y-1">
                    <ImageIcon className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Slot {slotIdx + 1}</span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRefs[slotIdx]}
                  className="hidden"
                  onChange={(e) => handleImageUpload(slotIdx, e.target.files[0])}
                />

                <button
                  type="button"
                  onClick={() => fileInputRefs[slotIdx].current?.click()}
                  className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition-opacity"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingSlot === slotIdx ? 'Uploading...' : imgUrl ? 'Replace' : 'Upload'}</span>
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 5. Specs & Features Tab */}
      {activeTab === 'specs' && (
        <Card className="p-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Key Feature Bullet Points</h3>
          <div className="space-y-2">
            {features.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 italic">No feature bullets added yet. Enter a technical spec below.</p>
            ) : (
              features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900/80 rounded-xl text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                  <span className="flex-1 text-slate-700 dark:text-slate-300">{feat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add a new technical feature bullet..."
                value={newFeatureInput}
                onChange={(e) => setNewFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                className="flex-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus-ring"
              />
              <Button size="sm" variant="secondary" onClick={handleAddFeature}>
                Add
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
