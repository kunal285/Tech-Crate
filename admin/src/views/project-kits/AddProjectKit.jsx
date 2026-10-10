'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Box,
  Save,
  Upload,
  Image as ImageIcon,
  Trash2,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Tabs from '../../components/ui/Tabs';

export default function AddProjectKit() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [uploadingCircuit, setUploadingCircuit] = useState(false);
  const [error, setError] = useState(null);

  // Turn-key Kit Images (Up to 4 slots)
  const [images, setImages] = useState([
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    '',
    '',
    '',
  ]);
  const [circuitDiagramUrl, setCircuitDiagramUrl] = useState('');

  const fileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const circuitInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'IoT',
    difficulty: 'Beginner',
    estimatedTimeHours: 3,
  });

  const handleImageUpload = async (slotIndex, file) => {
    if (!file) return;
    setUploadingSlot(slotIndex);
    setError(null);
    try {
      const data = new FormData();
      data.append('image', file);
      data.append('folder', 'projects');

      const res = await api.post('/upload/image', data, {
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
      setError('Image upload failed. Please verify image file format.');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleCircuitUpload = async (file) => {
    if (!file) return;
    setUploadingCircuit(true);
    setError(null);
    try {
      const data = new FormData();
      data.append('image', file);
      data.append('folder', 'projects');

      const res = await api.post('/upload/image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.url) {
        setCircuitDiagramUrl(res.data.url);
      }
    } catch (err) {
      console.error('[Circuit Upload Error]', err);
      setError('Schematic diagram upload failed.');
    } finally {
      setUploadingCircuit(false);
    }
  };

  const handleRemoveImage = (slotIndex) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[slotIndex] = '';
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a kit package title');
      return;
    }
    if (!formData.price) {
      alert('Please enter a kit price');
      return;
    }

    setIsSubmitting(true);
    try {
      const validImages = images.filter((img) => Boolean(img && img.trim()));

      await projectService.createProject({
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price) * 1.25,
        estimatedTimeHours: Number(formData.estimatedTimeHours) || 3,
        images: validImages.length > 0 ? validImages : [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        ],
        circuitDiagramUrl: circuitDiagramUrl.trim(),
      });
      router.push('/project-kits');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create kit package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'general', label: '1. Package Details' },
    { id: 'images', label: '2. Kit Box Photography' },
    { id: 'schematic', label: '3. Wiring Diagram' },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <PageHeader
        title="Create Turn-key Kit Package"
        subtitle="Bundle microcontrollers, sensors, cables, and packaging into a single sellable SKU with photos"
        breadcrumbs={[{ label: 'Catalog', href: '/project-kits' }, { label: 'New Kit' }]}
        action={
          <Button
            variant="outline"
            size="md"
            onClick={() => router.push('/project-kits')}
            icon={ArrowLeft}
          >
            Back to Kits
          </Button>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <Card className="p-6 sm:p-8 space-y-5">
            <Input
              label="Kit Package Title *"
              required
              placeholder="e.g. Turn-key Smart Agriculture & Soil Telemetry Kit"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Input
              label="Subtitle / Packaging Tagline"
              placeholder="e.g. Includes ESP32 NodeMCU, Capacitive Sensor, Relay & OLED display"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Select
                label="Kit Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={[
                  { label: 'IoT & Connected Devices', value: 'IoT' },
                  { label: 'Robotics & Automation', value: 'Robotics' },
                  { label: 'Embedded Systems', value: 'Embedded Systems' },
                  { label: 'Sensors & AI', value: 'Sensors & AI' },
                  { label: 'Automation', value: 'Automation' },
                  { label: 'Wearables', value: 'Wearables' },
                ]}
              />

              <Select
                label="Difficulty Level"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                options={[
                  { label: 'Beginner', value: 'Beginner' },
                  { label: 'Intermediate', value: 'Intermediate' },
                  { label: 'Advanced', value: 'Advanced' },
                ]}
              />

              <Input
                label="Selling Price (₹) *"
                type="number"
                min="0"
                required
                placeholder="1499"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />

              <Input
                label="MRP List Price (₹)"
                type="number"
                min="0"
                placeholder="1999"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              />
            </div>

            <Textarea
              label="Kit Description & Included Hardware BOM *"
              rows={5}
              required
              placeholder="Itemize all components packaged inside the anti-static kit box: boards, DuPont wires, breadboards, power modules, and instruction booklet."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Card>
        )}

        {/* Tab 2: Kit Box Images */}
        {activeTab === 'images' && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-primary" />
                <span>Kit Packaging & Unboxing Photography (4 Slots)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload clear photography of the product packaging, internal component layout, and bundled accessories. Slot 1 is the primary kit cover image.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 flex flex-col items-center justify-between min-h-[220px] transition-colors hover:border-brand-primary/50"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 self-start mb-2">
                    {idx === 0 ? '★ Primary Kit Box' : `Kit View ${idx + 1}`}
                  </span>

                  <div className="w-full flex-1 relative flex items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 mb-3">
                    {imgUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imgUrl}
                        alt={`Kit photo ${idx + 1}`}
                        className="w-full h-32 object-contain p-1"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-400">Empty Slot</span>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRefs[idx]}
                    className="hidden"
                    onChange={(e) => handleImageUpload(idx, e.target.files[0])}
                  />

                  {/* Slot Controls */}
                  <div className="w-full space-y-2">
                    <div className="flex items-center gap-1.5 w-full">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs[idx].current?.click()}
                        loading={uploadingSlot === idx}
                        icon={Upload}
                        className="flex-1 text-[11px] py-1 h-8 justify-center"
                      >
                        {imgUrl ? 'Replace' : 'Upload'}
                      </Button>

                      {imgUrl && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Remove image"
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <input
                      type="url"
                      placeholder="Or paste image URL"
                      value={imgUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setImages((prev) => {
                          const updated = [...prev];
                          updated[idx] = val;
                          return updated;
                        });
                      }}
                      className="w-full px-2.5 py-1 text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 3: Wiring Diagram */}
        {activeTab === 'schematic' && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <span>Wiring Guide & Assembly Diagram Image</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Optional: attach an assembly illustration or circuit diagram that customers will receive with the kit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  ref={circuitInputRef}
                  className="hidden"
                  onChange={(e) => handleCircuitUpload(e.target.files[0])}
                />

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => circuitInputRef.current?.click()}
                    loading={uploadingCircuit}
                    icon={Upload}
                  >
                    Upload Diagram File
                  </Button>
                  {circuitDiagramUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCircuitDiagramUrl('')}
                      icon={Trash2}
                      className="text-rose-500"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                <Input
                  label="Diagram Image URL"
                  placeholder="https://..."
                  value={circuitDiagramUrl}
                  onChange={(e) => setCircuitDiagramUrl(e.target.value)}
                  helperText="Direct image URL for kit assembly schematic"
                />
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center min-h-[220px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 self-start mb-2">
                  Assembly Diagram Preview
                </span>
                {circuitDiagramUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={circuitDiagramUrl}
                    alt="Kit assembly diagram"
                    className="max-h-48 w-full object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-white"
                  />
                ) : (
                  <div className="text-center p-6">
                    <Box className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No assembly diagram uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              const tabOrder = ['general', 'images', 'schematic'];
              const currIdx = tabOrder.indexOf(activeTab);
              if (currIdx > 0) setActiveTab(tabOrder[currIdx - 1]);
            }}
            disabled={activeTab === 'general'}
          >
            Previous Step
          </Button>

          <div className="flex items-center gap-3">
            {activeTab !== 'schematic' ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  const tabOrder = ['general', 'images', 'schematic'];
                  const currIdx = tabOrder.indexOf(activeTab);
                  if (currIdx < tabOrder.length - 1) setActiveTab(tabOrder[currIdx + 1]);
                }}
              >
                Next Step →
              </Button>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              icon={Save}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Save & Publish Kit Package
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
