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
  RefreshCw,
  Layers,
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

export default function EditProduct() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('basics');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Microcontrollers');
  const [stock, setStock] = useState(25);
  const [description, setDescription] = useState('');
  const [datasheetUrl, setDatasheetUrl] = useState('');
  const [isArchived, setIsArchived] = useState(false);

  // Specifications
  const [specifications, setSpecifications] = useState({
    operatingVoltage: '5V DC',
    pinCount: 'N/A',
    interface: 'I2C / SPI / GPIO',
    dimensions: '',
    weight: '',
  });

  // Pricing State
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');

  // Features List
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
        setIsDirty(true);
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
    setIsDirty(true);
  };

  const handleAddFeature = () => {
    if (newFeatureInput.trim()) {
      setFeatures((prev) => [...prev, newFeatureInput.trim()]);
      setNewFeatureInput('');
      setIsDirty(true);
    }
  };

  const handleRemoveFeature = (index) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
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

      setIsDirty(false);
      router.push('/products');
    } catch (err) {
      console.error('[Update Error]', err);
      setError(err.response?.data?.message || err.message || 'Error updating product.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'basics', label: '1. Identity & SKU' },
    { id: 'pricing', label: '2. Pricing & Stock' },
    { id: 'specs', label: '3. Technical Specs' },
    { id: 'media', label: '4. Images & Photos' },
    { id: 'features', label: '5. Key Features' },
  ];

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-primary dark:text-blue-400 mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading product datasheet and pricing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <PageHeader
        title="Edit Hardware Component"
        subtitle={`Updating details for "${title || 'Hardware Item'}" (ID: ${id})`}
        breadcrumbs={[{ label: 'Catalog', href: '/products' }, { label: 'Edit Product' }]}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push('/products')}
              icon={ArrowLeft}
            >
              Back to Catalog
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={isSaving}
              onClick={handleSave}
              icon={Save}
            >
              Update Hardware
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: Basics */}
        {activeTab === 'basics' && (
          <Card className="p-6 sm:p-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Product Title *"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. ESP32-WROOM-32D Development Board"
                  required
                />
              </div>
              <div>
                <Input
                  label="SKU Identifier"
                  value={sku}
                  onChange={(e) => {
                    setSku(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. TC-ESP32-DEV"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Primary Category *"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setIsDirty(true);
                }}
                options={CATEGORIES.map((c) => ({ label: c, value: c }))}
              />
              <Input
                label="Datasheet PDF Link"
                value={datasheetUrl}
                onChange={(e) => {
                  setDatasheetUrl(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="https://espressif.com/datasheet.pdf"
              />
            </div>

            <Textarea
              label="Engineering Description *"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setIsDirty(true);
              }}
              rows={5}
              placeholder="Provide a comprehensive technical overview: pinouts, flash size, wireless connectivity, and intended engineering applications."
              required
            />

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                  Catalog Archival Status
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  When archived, the product is hidden from customer browsing while historical orders remain intact.
                </span>
              </div>
              <Switch
                checked={isArchived}
                onChange={(val) => {
                  setIsArchived(val);
                  setIsDirty(true);
                }}
                label={isArchived ? 'Archived (Hidden)' : 'Active (Visible)'}
              />
            </div>
          </Card>
        )}

        {/* TAB 2: Pricing & Stock */}
        {activeTab === 'pricing' && (
          <Card className="p-6 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Original MRP (₹) *"
                  type="number"
                  min="0"
                  value={originalPrice}
                  onChange={(e) => {
                    setOriginalPrice(e.target.value);
                    setIsDirty(true);
                  }}
                  required
                />
              </div>
              <div>
                <Input
                  label="Selling / Discounted Price (₹)"
                  type="number"
                  min="0"
                  value={discountedPrice}
                  onChange={(e) => {
                    setDiscountedPrice(e.target.value);
                    setIsDirty(true);
                  }}
                />
              </div>
              <div>
                <Input
                  label="Live Warehouse Stock (Units) *"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => {
                    setStock(Number(e.target.value));
                    setIsDirty(true);
                  }}
                  required
                />
              </div>
            </div>

            {discountPercent && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200 text-xs">
                Calculated discount badge on customer storefront: <strong>{discountPercent}% OFF</strong>
              </div>
            )}
          </Card>
        )}

        {/* TAB 3: Specs */}
        {activeTab === 'specs' && (
          <Card className="p-6 sm:p-7 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Hardware Parameters & Operating Conditions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Operating Voltage"
                value={specifications.operatingVoltage}
                onChange={(e) => {
                  setSpecifications({ ...specifications, operatingVoltage: e.target.value });
                  setIsDirty(true);
                }}
                placeholder="e.g. 3.3V - 5V DC"
              />
              <Input
                label="Interface / Protocols"
                value={specifications.interface}
                onChange={(e) => {
                  setSpecifications({ ...specifications, interface: e.target.value });
                  setIsDirty(true);
                }}
                placeholder="e.g. I2C, SPI, UART, PWM"
              />
              <Input
                label="Pin Count / Form Factor"
                value={specifications.pinCount}
                onChange={(e) => {
                  setSpecifications({ ...specifications, pinCount: e.target.value });
                  setIsDirty(true);
                }}
                placeholder="e.g. 38 Pins Breadboard-friendly"
              />
              <Input
                label="Dimensions & Package"
                value={specifications.dimensions}
                onChange={(e) => {
                  setSpecifications({ ...specifications, dimensions: e.target.value });
                  setIsDirty(true);
                }}
                placeholder="e.g. 54.4mm x 27.9mm"
              />
            </div>
          </Card>
        )}

        {/* TAB 4: Media */}
        {activeTab === 'media' && (
          <Card className="p-6 sm:p-7 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Product Photography & Gallery (Up to 4 Angles)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 flex flex-col justify-between"
                >
                  <div className="relative aspect-square rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    {imgUrl ? (
                      <img src={imgUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <Input
                    placeholder="Image URL or upload"
                    value={imgUrl}
                    onChange={(e) => updateImageUrl(idx, e.target.value)}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRefs[idx]}
                    className="hidden"
                    onChange={(e) => handleImageUpload(idx, e.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={uploadingSlot === idx}
                    onClick={() => fileInputRefs[idx].current?.click()}
                    icon={Upload}
                    className="w-full"
                  >
                    Upload File
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* TAB 5: Features */}
        {activeTab === 'features' && (
          <Card className="p-6 sm:p-7 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Bullet Highlights & Key Capabilities
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Integrated 2.4 GHz Wi-Fi and Bluetooth BLE 4.2"
                value={newFeatureInput}
                onChange={(e) => setNewFeatureInput(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="primary" size="md" onClick={handleAddFeature} icon={Plus}>
                Add Feature
              </Button>
            </div>
            <div className="space-y-2 pt-2">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200"
                >
                  <span>• {feat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => router.push('/products')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSaving}
            icon={Save}
          >
            Update Hardware
          </Button>
        </div>
      </form>
    </div>
  );
}
