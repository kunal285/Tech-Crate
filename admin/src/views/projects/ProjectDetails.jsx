'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Cpu,
  Code,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Clock,
  Zap,
  Image as ImageIcon,
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import PageHeader from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function ProjectDetails() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await projectService.getProjectById(id);
        setProject(data);
        if (Array.isArray(data?.images) && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        } else if (data?.circuitDiagramUrl) {
          setSelectedImage(data.circuitDiagramUrl);
        }
      } catch (err) {
        console.error('Failed to load project:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleCopyCode = () => {
    if (!project?.codeSnippet) return;
    navigator.clipboard.writeText(project.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project blueprint? This action is permanent.')) {
      return;
    }
    try {
      await projectService.deleteProject(id);
      router.push('/projects');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <PageHeader
          title="Loading Project..."
          breadcrumbs={[{ label: 'Catalog', href: '/projects' }, { label: 'Loading' }]}
        />
        <Card className="p-8 animate-pulse space-y-4">
          <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </Card>
      </div>
    );
  }

  const title = project?.title || 'Engineering Project Blueprint';
  const price = project?.price || 1499;
  const category = project?.category || 'IoT';
  const difficulty = project?.difficulty || 'Intermediate';
  const description = project?.description || '';
  const codeSnippet = project?.codeSnippet || '// No firmware code uploaded';
  const images = Array.isArray(project?.images) ? project.images.filter(Boolean) : [];
  const circuitDiagram = project?.circuitDiagramUrl || '';

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <PageHeader
        title={title}
        subtitle={`Firmware blueprint, hardware photography, and schematic dossier for ID: ${id}`}
        breadcrumbs={[{ label: 'Catalog', href: '/projects' }, { label: title }]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push('/projects')}
              icon={ArrowLeft}
            >
              Back to Projects
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
          </div>
        }
      />

      {/* Main Dossier Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" size="sm">
                {category}
              </Badge>
              <Badge variant="neutral" size="sm">
                {difficulty}
              </Badge>
              {project?.estimatedTimeHours && (
                <Badge variant="neutral" size="sm">
                  ⏱ {project.estimatedTimeHours} Hours
                </Badge>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            {project?.subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {project.subtitle}
              </p>
            )}
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            ₹{Number(price).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Photography Showcase & Gallery */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
            Hardware Photography & Gallery
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large Preview */}
            <div className="md:col-span-2 aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative flex items-center justify-center">
              {selectedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedImage}
                  alt={title}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-center p-6">
                  <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No project photography uploaded</p>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[300px]">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 md:w-full md:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-brand-primary shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}

              {circuitDiagram && (
                <button
                  type="button"
                  onClick={() => setSelectedImage(circuitDiagram)}
                  className={`w-20 h-20 md:w-full md:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all relative ${
                    selectedImage === circuitDiagram
                      ? 'border-emerald-500 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={circuitDiagram} alt="Schematic" className="w-full h-full object-contain bg-white" />
                  <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[8px] font-bold text-center py-0.5">
                    Schematic
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Circuit Diagram Section */}
        {circuitDiagram && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                Circuit Schematic & Wiring Pinout
              </span>
              <a
                href={circuitDiagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
              >
                <span>View Full Resolution</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={circuitDiagram}
                alt="Circuit schematic diagram"
                className="max-h-80 object-contain rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
            Project Overview & Architecture
          </span>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {description}
          </p>
        </div>

        {/* Embedded Firmware Sketch */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
              Embedded Firmware Sketch (C++ / Arduino / MicroPython)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              icon={copied ? Check : Copy}
            >
              {copied ? 'Copied' : 'Copy Code'}
            </Button>
          </div>
          <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 text-xs font-mono overflow-x-auto shadow-inner">
            <pre>{codeSnippet}</pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
