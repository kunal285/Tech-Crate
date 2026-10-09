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
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'code' | 'circuit'
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
          Loading schematics and firmware code...
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
    description,
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
        images: project.images || images,
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

  const heroImage =
    (images && images[0]) ||
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80';

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
        {/* Left Column: Project Showcase & Guide Tabs (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Hero Showcase Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
            <div className="relative w-full aspect-video bg-slate-100 overflow-hidden">
              <Image
                src={heroImage}
                alt={title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
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

            <div className="p-5 space-y-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {title}
              </h1>

              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {subtitle}
                </p>
              )}

              {/* Meta stats row */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Build Time: ~{estimatedTimeHours} Hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{rating} ({buildCount} makers completed)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200/80">
            {[
              { id: 'guide', label: 'Step-by-Step Guide', icon: ListOrdered },
              { id: 'code', label: 'Firmware Code', icon: FileCode },
              { id: 'circuit', label: 'Circuit Schematics', icon: Cpu },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content 1: Step-by-Step Guide */}
          {activeTab === 'guide' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Build Instructions
              </h3>

              {stepByStepGuide.length > 0 ? (
                <div className="space-y-4">
                  {stepByStepGuide.map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-xs">
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
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {description ||
                    'Connect components according to the circuit diagram, flash the firmware to your microcontroller board, and power via USB or battery.'}
                </p>
              )}
            </div>
          )}

          {/* Tab Content 2: Firmware Code */}
          {activeTab === 'code' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" style={{ color: BRAND.navy }} />
                  <span className="text-xs font-bold text-slate-900">Arduino / C++ Code</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleDownloadCode}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white transition-all shadow-sm"
                    style={{ backgroundColor: BRAND.navy }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .ino</span>
                  </button>
                </div>
              </div>

              <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed">
                <code>
                  {codeSnippet ||
                    `// Tech Crate Firmware Example\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n}`}
                </code>
              </pre>
            </div>
          )}

          {/* Tab Content 3: Circuit Schematics */}
          {activeTab === 'circuit' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Wiring & Circuit Schematics
              </h3>
              {circuitDiagramUrl ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200">
                  <Image
                    src={circuitDiagramUrl}
                    alt="Circuit diagram"
                    fill
                    className="object-contain bg-slate-50"
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Standard wiring diagram included in the hardware kit package.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Complete Hardware Kit Purchase Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <span
              className="text-[10px] font-extrabold uppercase tracking-wider block"
              style={{ color: BRAND.orange }}
            >
              Complete Project Kit
            </span>

            <h3 className="text-base font-bold text-slate-900">
              Get All Required Components in One Box
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-500">₹</span>
              <span className="text-2xl font-black" style={{ color: BRAND.navy }}>
                {Number(price).toLocaleString('en-IN')}
              </span>
              {originalPrice > price && (
                <span className="text-xs font-semibold text-slate-400 line-through">
                  ₹{Number(originalPrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Bill of Materials */}
            {componentsRequired.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                  Included in Kit:
                </span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {componentsRequired.map((comp, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{comp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
                  <span>Add Kit to Cart</span>
                </>
              )}
            </button>

            {/* Value Guarantees */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Fast dispatch in ESD anti-static packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% pre-tested compatible hardware</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
