'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Cpu,
  Save,
  Upload,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Code,
  Layers,
  Sparkles,
  Zap,
  Boxes,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
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

export default function EditProject({ projectId }) {
  const params = useParams();
  const id = projectId || params?.id;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [uploadingCircuit, setUploadingCircuit] = useState(false);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Gallery Images (Up to 4 slots)
  const [images, setImages] = useState(['', '', '', '']);
  const [circuitDiagramUrl, setCircuitDiagramUrl] = useState('');

  const fileInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const circuitInputRef = useRef(null);

  // Bill of Materials (BOM) Items
  const [componentsRequired, setComponentsRequired] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'IoT',
    difficulty: 'Beginner',
    price: '',
    originalPrice: '',
    estimatedTimeHours: '',
    codeSnippet: '',
  });

  // Fetch project on mount
  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await projectService.getProjectById(id);
        const data = (res && res.data && !res.title) ? res.data : res;
        if (data) {
          setFormData({
            title: data.title || '',
            subtitle: data.subtitle || '',
            description: data.description || '',
            category: data.category || 'IoT',
            difficulty: data.difficulty || 'Beginner',
            price: data.price !== undefined ? String(data.price) : '',
            originalPrice: data.originalPrice !== undefined ? String(data.originalPrice) : '',
            estimatedTimeHours: data.estimatedTimeHours !== undefined ? String(data.estimatedTimeHours) : '',
            codeSnippet: data.codeSnippet || '',
          });

          // Pad images array to 4 slots
          const loadedImages = Array.isArray(data.images) ? [...data.images] : [];
          while (loadedImages.length < 4) {
            loadedImages.push('');
          }
          setImages(loadedImages.slice(0, 4));

          setCircuitDiagramUrl(data.circuitDiagramUrl || '');
          setComponentsRequired(
            Array.isArray(data.componentsRequired)
              ? data.componentsRequired.map((c) => ({
                  name: c.name || '',
                  quantity: c.quantity || 1,
                  specification: c.specification || '',
                }))
              : []
          );
        }
      } catch (err) {
        console.error('Failed to load project for editing:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // Unsaved changes warning
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

  const handleAddComponent = () => {
    setComponentsRequired([
      ...componentsRequired,
      { name: '', quantity: 1, specification: 'Included in Kit' },
    ]);
    setIsDirty(true);
  };

  const handleUpdateComponent = (index, field, value) => {
    const updated = [...componentsRequired];
    updated[index][field] = value;
    setComponentsRequired(updated);
    setIsDirty(true);
  };

  const handleRemoveComponent = (index) => {
    setComponentsRequired(componentsRequired.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleQuickAddPreset = (preset) => {
    setComponentsRequired([...componentsRequired, preset]);
    setIsDirty(true);
  };

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
        setIsDirty(true);
      }
    } catch (err) {
      console.error('[Upload Error]', err);
      setError('Image upload failed. Please verify format (PNG/JPG/WEBP).');
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
        setIsDirty(true);
      }
    } catch (err) {
      console.error('[Circuit Upload Error]', err);
      setError('Circuit diagram upload failed.');
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
    setIsDirty(true);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project blueprint? This action is permanent.')) {
      return;
    }
    try {
      await projectService.deleteProject(id);
      setIsDirty(false);
      router.push('/projects');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete project');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!id) {
      setError('Cannot save: Invalid project ID.');
      return;
    }
    if (!formData.title.trim()) {
      setError('Please enter a project title');
      setActiveTab('general');
      return;
    }
    if (!formData.price) {
      setError('Please enter a turnkey kit price');
      setActiveTab('general');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const validImages = images.filter((img) => Boolean(img && img.trim()));
      const validBOM = componentsRequired
        .filter((c) => Boolean(c.name && c.name.trim()))
        .map((c) => {
          const item = {
            name: c.name.trim(),
            quantity: Number(c.quantity) || 1,
            specification: (c.specification || '').trim(),
          };
          if (c.productId && String(c.productId).length === 24) {
            item.productId = c.productId;
          }
          if (c.unitPrice) {
            item.unitPrice = Number(c.unitPrice) || 0;
          }
          return item;
        });

      await projectService.updateProject(id, {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : 0,
        estimatedTimeHours: Number(formData.estimatedTimeHours) || 0,
        componentsRequired: validBOM,
        images: validImages,
        circuitDiagramUrl: circuitDiagramUrl.trim(),
      });
      setIsDirty(false);
      router.push(`/projects/${id}`);
    } catch (err) {
      console.error('[Update Project Error]', err);
      setError(err.response?.data?.message || err.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'general', label: '1. General Info' },
    { id: 'bom', label: `2. Bill of Materials (${componentsRequired.length})` },
    { id: 'images', label: '3. Images & Gallery' },
    { id: 'circuit', label: '4. Schematic & Pinout' },
    { id: 'firmware', label: '5. Firmware Code' },
  ];

  const bomPresets = [
    { name: 'Arduino Uno R3 (CH340G) Board', quantity: 1, specification: '16MHz 5V ATmega328P' },
    { name: 'ESP32 NodeMCU Wi-Fi + BLE', quantity: 1, specification: '30-Pin Dual-Core 240MHz' },
    { name: '0.96" I2C OLED Display Module (128x64)', quantity: 1, specification: 'SSD1306 4-Pin' },
    { name: 'HC-SR04 Ultrasonic Distance Sensor', quantity: 1, specification: '2cm - 400cm Range' },
    { name: 'SG90 Micro Servo Motor 9g', quantity: 1, specification: '180 Degree PWM' },
    { name: '5V Single-Channel Relay Module', quantity: 1, specification: 'Optocoupler isolated' },
    { name: 'Active 5V Piezo Buzzer Module', quantity: 1, specification: 'Audio alert trigger' },
    { name: '400 Tie-Point Solderless Breadboard', quantity: 1, specification: 'Circuit assembly base' },
    { name: '9V Battery Clip with DC 2.1mm Barrel Jack', quantity: 1, specification: 'External power harness' },
  ];

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <PageHeader
          title="Loading Project..."
          breadcrumbs={[{ label: 'Catalog', href: '/projects' }, { label: 'Edit Project' }]}
        />
        <Card className="p-8 animate-pulse space-y-4">
          <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <PageHeader
        title="Edit Engineering Project"
        subtitle={`Update blueprint specifications, BOM matrix, circuit schematic, and firmware for ID: ${id}`}
        breadcrumbs={[
          { label: 'Catalog', href: '/projects' },
          { label: formData.title || 'Project Details', href: `/projects/${id}` },
          { label: 'Edit' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push(`/projects/${id}`)}
              icon={ArrowLeft}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleDelete}
              icon={Trash2}
              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              Delete
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              loading={isSubmitting}
              icon={Save}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <Card className="p-6 sm:p-8 space-y-5">
            <Input
              label="Project Title *"
              required
              placeholder="e.g. Smart IoT Plant Watering & Telemetry System"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                setIsDirty(true);
              }}
            />

            <Input
              label="Subtitle / Headline"
              placeholder="e.g. Automate soil moisture monitoring with ESP32 and capacitive probe"
              value={formData.subtitle}
              onChange={(e) => {
                setFormData({ ...formData, subtitle: e.target.value });
                setIsDirty(true);
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  setIsDirty(true);
                }}
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
                onChange={(e) => {
                  setFormData({ ...formData, difficulty: e.target.value });
                  setIsDirty(true);
                }}
                options={[
                  { label: 'Beginner', value: 'Beginner' },
                  { label: 'Intermediate', value: 'Intermediate' },
                  { label: 'Advanced', value: 'Advanced' },
                ]}
              />

              <Input
                label="Turnkey Kit Price (₹) *"
                type="number"
                min="0"
                required
                placeholder="1499"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  setIsDirty(true);
                }}
              />

              <Input
                label="Estimated Build Time"
                type="number"
                min="0"
                placeholder="Hours (e.g. 4)"
                value={formData.estimatedTimeHours}
                onChange={(e) => {
                  setFormData({ ...formData, estimatedTimeHours: e.target.value });
                  setIsDirty(true);
                }}
              />
            </div>

            <Textarea
              label="Project Overview & Architecture Description *"
              rows={5}
              required
              placeholder="Detail the circuit architecture, hardware operation, and learning objectives for makers..."
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                setIsDirty(true);
              }}
            />
          </Card>
        )}

        {/* Tab 2: Bill of Materials (BOM) */}
        {activeTab === 'bom' && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-brand-primary" />
                  <span>Bill of Materials (BOM) & Components Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Itemize all hardware modules, ICs, sensors, and cables packaged inside the turnkey kit.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddComponent}
                icon={Plus}
              >
                Add Component
              </Button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Quick Add Maker Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {bomPresets.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleQuickAddPreset(preset)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/80 dark:border-slate-700"
                  >
                    <PlusCircle className="w-3 h-3 text-brand-primary" />
                    <span>{preset.name.split(' ')[0]} {preset.name.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* BOM Rows */}
            <div className="space-y-3 pt-2">
              {componentsRequired.map((comp, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <span className="w-6 text-center font-bold text-xs text-slate-400">
                    #{idx + 1}
                  </span>

                  {/* Component Name */}
                  <div className="flex-1 w-full sm:w-auto">
                    <input
                      type="text"
                      required
                      placeholder="Component Name (e.g. ESP32 NodeMCU, Relay Module)"
                      value={comp.name}
                      onChange={(e) => handleUpdateComponent(idx, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="w-24 shrink-0">
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Qty"
                      value={comp.quantity}
                      onChange={(e) => handleUpdateComponent(idx, 'quantity', Number(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 text-xs text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-primary font-bold tabular-nums"
                    />
                  </div>

                  {/* Specification / Role */}
                  <div className="flex-1 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Role / Spec (e.g. 5V VCC, 400 tie-points, I2C)"
                      value={comp.specification}
                      onChange={(e) => handleUpdateComponent(idx, 'specification', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveComponent(idx)}
                    title="Remove component from BOM"
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {componentsRequired.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <Boxes className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No BOM components added yet</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddComponent}
                    className="mt-2 text-xs"
                  >
                    Add First Component
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Tab 3: Images & Gallery */}
        {activeTab === 'images' && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-primary" />
                <span>Project Photography & Visual Showcase (4 Slots)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload photos of the assembled project, sensors, wiring, or working prototype. Slot 1 is used as the primary card cover thumbnail.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-video sm:aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-2"
                >
                  {imgUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`Project gallery photo slot ${idx + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 transition-colors shadow-sm"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-2 p-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                          Slot {idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {idx === 0 ? 'Primary Thumbnail' : 'Additional View'}
                        </span>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRefs[idx]}
                    className="hidden"
                    onChange={(e) => handleImageUpload(idx, e.target.files?.[0])}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRefs[idx].current?.click()}
                    disabled={uploadingSlot === idx}
                    className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition-opacity rounded-2xl backdrop-blur-xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>
                      {uploadingSlot === idx
                        ? 'Uploading...'
                        : imgUrl
                        ? 'Replace Image'
                        : 'Upload Photo'}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {/* Direct URL input fallback */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                Or Paste Primary Image URL Directly:
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or cloud CDN url"
                  value={images[0] || ''}
                  onChange={(e) => {
                    const updated = [...images];
                    updated[0] = e.target.value;
                    setImages(updated);
                    setIsDirty(true);
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Tab 4: Schematic & Pinout */}
        {activeTab === 'circuit' && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-primary" />
                <span>Circuit Schematic & Breadboard Wiring Diagram</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload a high-resolution Fritzing schematic or circuit CAD diagram to guide makers through pin-to-pin wiring.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                accept="image/*"
                ref={circuitInputRef}
                className="hidden"
                onChange={(e) => handleCircuitUpload(e.target.files?.[0])}
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => circuitInputRef.current?.click()}
                disabled={uploadingCircuit}
                icon={Upload}
              >
                {uploadingCircuit ? 'Uploading Schematic...' : 'Upload Schematic Image'}
              </Button>
              <span className="text-xs text-slate-400">or enter direct diagram URL below</span>
            </div>

            <Input
              label="Schematic Diagram Image URL"
              placeholder="https://... circuit diagram or fritzing schematic image"
              value={circuitDiagramUrl}
              onChange={(e) => {
                setCircuitDiagramUrl(e.target.value);
                setIsDirty(true);
              }}
            />

            {circuitDiagramUrl && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Schematic Preview
                  </span>
                  <a
                    href={circuitDiagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Open Full Size</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={circuitDiagramUrl}
                    alt="Circuit diagram preview"
                    className="max-h-72 object-contain rounded-xl"
                  />
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Tab 5: Firmware Code */}
        {activeTab === 'firmware' && (
          <Card className="p-6 sm:p-8 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Code className="w-4 h-4 text-brand-primary" />
                <span>Firmware Blueprint (C++ / Arduino IDE / MicroPython)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Provide clean, commented starter code that makers can flash onto their microcontroller board.
              </p>
            </div>

            <Textarea
              label="Firmware Sketch Source Code"
              rows={12}
              className="font-mono text-xs bg-slate-950 text-emerald-400 border-slate-800"
              placeholder="// Paste your Arduino/ESP32 sketch here..."
              value={formData.codeSnippet}
              onChange={(e) => {
                setFormData({ ...formData, codeSnippet: e.target.value });
                setIsDirty(true);
              }}
            />
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                const tabOrder = ['general', 'bom', 'images', 'circuit', 'firmware'];
                const currIdx = tabOrder.indexOf(activeTab);
                if (currIdx > 0) setActiveTab(tabOrder[currIdx - 1]);
              }}
              disabled={activeTab === 'general'}
            >
              Previous Tab
            </Button>
            {activeTab !== 'firmware' && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  const tabOrder = ['general', 'bom', 'images', 'circuit', 'firmware'];
                  const currIdx = tabOrder.indexOf(activeTab);
                  if (currIdx < tabOrder.length - 1) setActiveTab(tabOrder[currIdx + 1]);
                }}
              >
                Next Tab
              </Button>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            icon={Save}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
