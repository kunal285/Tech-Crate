'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Code2,
  Clock,
  Cpu,
  Layers,
  ChevronRight,
  Download,
  Copy,
  Check,
  ShoppingCart,
  Zap,
  Star,
  FileCode,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ListOrdered,
  Truck,
  RotateCcw,
  ExternalLink,
  PackageCheck,
  CheckCircle2,
  FileText,
  Boxes,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

// Helper to extract or structure Bill of Materials (BOM) items
function getBOMItems(componentsRequired, description) {
  if (Array.isArray(componentsRequired) && componentsRequired.length > 0) {
    return componentsRequired.map((item) => {
      if (typeof item === 'string') return { name: item, quantity: 1, specification: 'Original Component' };
      return {
        name: item.name || item.title || 'Hardware Module',
        quantity: item.quantity || 1,
        specification: item.specification || item.specs || 'Tested & verified',
      };
    });
  }

  // Parse lines from description if user provided bullet points or component lines
  if (description) {
    const lines = description.split('\n').map((l) => l.trim()).filter(Boolean);
    const bomLines = lines.filter(
      (l) =>
        /^[-*•\d+.]\s+/i.test(l) ||
        /\b(esp32|arduino|sensor|relay|oled|resistor|jumper|breadboard|module|motor|servo|display|battery|wire|probe|ch340|microcontroller|buzzer|potentiometer|capacitor)\b/i.test(
          l
        )
    );

    if (bomLines.length > 0) {
      return bomLines.map((line) => {
        const cleaned = line.replace(/^[-*•\d+.)]\s*/, '').trim();
        const qtyMatch = cleaned.match(/(?:x\s*(\d+)|\((\d+)\s*x?\)|\b(\d+)\s*(?:nos|pcs|units?)\b)/i);
        const qty = qtyMatch ? Number(qtyMatch[1] || qtyMatch[2] || qtyMatch[3]) : 1;
        return {
          name: cleaned,
          quantity: qty,
          specification: 'Included in Kit Box',
        };
      });
    }
  }

  // Fallback authentic kit contents
  return [
    { name: 'Core Microcontroller Development Board', quantity: 1, specification: 'Pre-flashed & Tested' },
    { name: 'Primary Analog / Digital Sensor Probe', quantity: 1, specification: 'Calibrated Precision' },
    { name: 'Display or Actuator Output Module', quantity: 1, specification: 'I2C / PWM Interface' },
    { name: 'Solderless Prototyping Breadboard', quantity: 1, specification: '400 Tie-Points' },
    { name: 'DuPont Jumper Wires Ribbon Cable Harness', quantity: 20, specification: 'M-to-M & M-to-F' },
    { name: 'High-Speed USB Data & Power Cable', quantity: 1, specification: 'Firmware Flashing' },
  ];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('bom'); // 'bom' | 'guide' | 'code' | 'circuit'
  const [activeImage, setActiveImage] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProject() {
      if (!params.id) return;
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get(`/projects/${params.id}`);
        const fetched = res.data?.project || res.data;
        setProject(fetched);

        // Set default active image
        const imgList = Array.isArray(fetched?.images) ? fetched.images.filter(Boolean) : [];
        if (imgList.length > 0) {
          setActiveImage(imgList[0]);
        } else if (fetched?.circuitDiagramUrl) {
          setActiveImage(fetched.circuitDiagramUrl);
        }
      } catch (err) {
        console.error('Failed to load project:', err);
        setError('Project kit not found.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProject();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} />
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Loading project schematic, BOM, and firmware code...
        </p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm my-8">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Project Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          The requested DIY project tutorial or code guide does not exist.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm"
          style={{ backgroundColor: BRAND.navy }}
        >
          Back to Project Hub
        </Link>
      </div>
    );
  }

  const {
    title,
    subtitle,
    description = '',
    category = 'Electronics',
    difficulty = 'Beginner',
    estimatedTimeHours = 3,
    price = 1499,
    originalPrice = 1899,
    images = [],
    componentsRequired = [],
    circuitDiagramUrl,
    codeSnippet = '',
    stepByStepGuide = [],
    rating = 4.8,
    buildCount = 42,
  } = project;

  const validImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const currentHeroImage =
    activeImage ||
    validImages[0] ||
    circuitDiagramUrl ||
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80';

  const bomItems = getBOMItems(componentsRequired, description);

  const handleCopyCode = () => {
    if (!codeSnippet) return;
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadCode = () => {
    if (!codeSnippet) return;
    const blob = new Blob([codeSnippet], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_firmware.ino`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddKitToCart = async () => {
    setIsAdding(true);
    const ok = await addToCart(
      {
        _id: project._id,
        title: `${title} (Complete Kit)`,
        price: project.price || price,
        images: validImages.length > 0 ? validImages : [currentHeroImage],
        itemType: 'kit',
        projectKit: project._id,
      },
      1
    );
    setIsAdding(false);
    if (ok) {
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2500);
    }
  };

  const tabs = [
    { id: 'bom', label: 'Bill of Materials (BOM)', icon: Boxes },
    { id: 'circuit', label: 'Circuit Schematics', icon: Cpu },
    { id: 'code', label: 'Firmware Code', icon: FileCode },
    { id: 'guide', label: 'Build Instructions', icon: ListOrdered },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link href="/projects" className="hover:text-slate-900 transition-colors">
          Project Hub
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-800 font-bold truncate max-w-xs">{title}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Project Showcase, Overview, Tabs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hero Showcase Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
            {/* Primary Image Viewport */}
            <div className="relative w-full aspect-video bg-slate-100 overflow-hidden">
              <Image
                src={currentHeroImage}
                alt={title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-contain p-2 bg-slate-50"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase text-white shadow-sm"
                  style={{ backgroundColor: BRAND.orange }}
                >
                  {difficulty}
                </span>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-900/80 text-white backdrop-blur-sm shadow-sm">
                  {category}
                </span>
              </div>
            </div>

            {/* Thumbnail Switcher (if multiple images or circuit diagram exist) */}
            {(validImages.length > 1 || circuitDiagramUrl) && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2.5 overflow-x-auto scrollbar-none">
                {validImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      currentHeroImage === img
                        ? 'border-brand-primary shadow-sm scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${idx + 1}`} fill sizes="64px" className="object-cover" />
                  </button>
                ))}

                {circuitDiagramUrl && (
                  <button
                    type="button"
                    onClick={() => setActiveImage(circuitDiagramUrl)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      currentHeroImage === circuitDiagramUrl
                        ? 'border-emerald-500 shadow-sm scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={circuitDiagramUrl} alt="Schematic" fill sizes="64px" className="object-contain bg-white" />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[8px] font-bold text-center py-0.5">
                      Schematic
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Title & Stats */}
            <div className="p-5 sm:p-6 space-y-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {title}
              </h1>

              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {subtitle}
                </p>
              )}

              {/* Meta Stats Row */}
              <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-500 border-t border-slate-100">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Build Time: ~{estimatedTimeHours} Hours</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{rating} ({buildCount} makers completed)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Pin-Compatible BOM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Overview & Architecture Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Project Overview & Architecture
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
              {description ||
                'This DIY engineering project provides a complete end-to-end hardware tutorial with pin compatibility, itemized components, and tested firmware code.'}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-100 border border-slate-200/80 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap select-none ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content 1: Bill of Materials (BOM) */}
          {activeTab === 'bom' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-brand-primary" />
                    <span>Bill of Materials (BOM) & Components Matrix</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Itemized list of hardware required to assemble and operate this project.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200 self-start sm:self-auto">
                  {bomItems.length} Components
                </span>
              </div>

              {/* BOM Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3.5">#</th>
                      <th className="py-2.5 px-3.5">Component / Hardware</th>
                      <th className="py-2.5 px-3.5 text-center">Qty</th>
                      <th className="py-2.5 px-3.5">Specification / Role</th>
                      <th className="py-2.5 px-3.5 text-right">Kit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bomItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3.5 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3.5 font-bold text-slate-900">{item.name}</td>
                        <td className="py-3 px-3.5 text-center font-bold text-slate-700 tabular-nums">
                          {item.quantity}x
                        </td>
                        <td className="py-3 px-3.5 text-slate-600">{item.specification}</td>
                        <td className="py-3 px-3.5 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            <Check className="w-3 h-3" />
                            <span>Included</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quality Guarantee Note */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
                <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  All BOM hardware is supplied in anti-static ESD packaging with labeled component headers and testing verification.
                </span>
              </div>
            </div>
          )}

          {/* Tab Content 2: Circuit Schematics */}
          {activeTab === 'circuit' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-600" />
                    <span>Wiring & Circuit Schematics</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fritzing electrical breadboard diagram and pin interconnection map.
                  </p>
                </div>
                {circuitDiagramUrl && (
                  <a
                    href={circuitDiagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-brand-primary bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <span>Open High-Res</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {circuitDiagramUrl ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <Image
                    src={circuitDiagramUrl}
                    alt="Circuit diagram schematic"
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-contain p-2"
                  />
                </div>
              ) : (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                  <Cpu className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    Standard breadboard pinout schematic is included in the turnkey hardware kit packaging.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab Content 3: Firmware Code */}
          {activeTab === 'code' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" style={{ color: BRAND.navy }} />
                  <span className="text-xs font-bold text-slate-900">Arduino / C++ Firmware Code</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCode}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm"
                    style={{ backgroundColor: BRAND.navy }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .ino</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-[420px] leading-relaxed shadow-inner">
                <code>
                  {codeSnippet ||
                    `// Tech Crate Firmware Blueprint\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n}`}
                </code>
              </pre>
            </div>
          )}

          {/* Tab Content 4: Build Instructions */}
          {activeTab === 'guide' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-brand-primary" />
                <span>Step-by-Step Build Instructions</span>
              </h3>

              {stepByStepGuide.length > 0 ? (
                <div className="space-y-4">
                  {stepByStepGuide.map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-xs p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white font-extrabold text-[11px] shrink-0"
                        style={{ backgroundColor: BRAND.navy }}
                      >
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900">{step.title || `Step ${idx + 1}`}</h4>
                        <p className="text-slate-600 leading-relaxed">{step.description || step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                  <div className="flex gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-extrabold text-[11px] shrink-0"
                      style={{ backgroundColor: BRAND.navy }}
                    >
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Wire the Circuit</h4>
                      <p className="text-slate-600 mt-0.5">
                        Place the development board on the breadboard and connect sensors according to the Circuit Schematics tab using DuPont jumper wires.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-extrabold text-[11px] shrink-0"
                      style={{ backgroundColor: BRAND.navy }}
                    >
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Flash Firmware Code</h4>
                      <p className="text-slate-600 mt-0.5">
                        Download the .ino sketch from the Firmware Code tab, open it in Arduino IDE, select your COM port, and upload.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-extrabold text-[11px] shrink-0"
                      style={{ backgroundColor: BRAND.navy }}
                    >
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Power Up & Verify Telemetry</h4>
                      <p className="text-slate-600 mt-0.5">
                        Open Serial Monitor at 115200 baud to observe telemetry readouts and sensor feedback.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Turn-key Hardware Kit Purchase Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <span
              className="text-[10px] font-extrabold uppercase tracking-wider block"
              style={{ color: BRAND.orange }}
            >
              Complete Turn-key Project Kit
            </span>

            <h3 className="text-base font-bold text-slate-900 leading-snug">
              Get All Required Components in One Box
            </h3>

            {/* Pricing Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-500">₹</span>
              <span className="text-2xl font-black" style={{ color: BRAND.navy }}>
                {Number(price).toLocaleString('en-IN')}
              </span>
              {originalPrice > price && (
                <>
                  <span className="text-xs font-semibold text-slate-400 line-through">
                    ₹{Number(originalPrice).toLocaleString('en-IN')}
                  </span>
                  <span className="ml-auto text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                    {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Bill of Materials Quick Checklist */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                <span>Included in Box ({bomItems.length}):</span>
                <span className="text-brand-primary cursor-pointer hover:underline" onClick={() => setActiveTab('bom')}>
                  View All
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {bomItems.slice(0, 5).map((comp, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{comp.name}</span>
                  </li>
                ))}
                {bomItems.length > 5 && (
                  <li className="text-[11px] font-semibold text-slate-400 pl-5.5">
                    + {bomItems.length - 5} additional items & cables
                  </li>
                )}
              </ul>
            </div>

            {/* Add to Cart CTA */}
            <button
              type="button"
              onClick={handleAddKitToCart}
              disabled={isAdding}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 ${
                addSuccess ? 'bg-emerald-600' : ''
              }`}
              style={{
                backgroundColor: addSuccess ? undefined : BRAND.navy,
              }}
            >
              {addSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Kit Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add Turn-key Kit to Cart</span>
                </>
              )}
            </button>

            {/* Value Guarantees */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Fast campus dispatch in ESD anti-static pack</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% pre-tested hardware compatibility</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Instant firmware & pinout code access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
