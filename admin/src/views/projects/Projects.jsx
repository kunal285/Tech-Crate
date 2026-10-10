'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, Plus, Code, Layers, RefreshCw, ArrowRight } from 'lucide-react';
import { projectService } from '../../services/projectService';
import PageHeader from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Engineering Project Hub"
        subtitle="Manage turn-key DIY electronics project kits, schematic diagrams, code repositories, and bill-of-materials"
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Projects' }]}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={loadProjects}
              loading={loading}
              icon={RefreshCw}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/projects/create')}
              icon={Plus}
            >
              Create Project
            </Button>
          </div>
        }
      />

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="w-32 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            icon={Cpu}
            title="No engineering projects yet"
            description="Create your first DIY project kit with pinouts, circuit diagram, and BOM component list."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/projects/create')}
                icon={Plus}
              >
                Create First Project
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const projectImage =
              (Array.isArray(p.images) && p.images[0]) ||
              p.image ||
              p.circuitDiagramUrl ||
              'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';

            return (
              <Card
                key={p._id}
                className="p-5 hover:border-brand-primary/40 dark:hover:border-blue-500/40 transition-colors flex flex-col justify-between"
              >
                <div className="flex gap-4 items-start">
                  {/* Project Image Thumbnail */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={projectImage}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                    {Array.isArray(p.images) && p.images.length > 1 && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[9px] font-bold">
                        +{p.images.length - 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="primary" size="sm">
                          {p.category || 'IoT'}
                        </Badge>
                        {p.difficulty && (
                          <Badge variant="neutral" size="sm">
                            {p.difficulty}
                          </Badge>
                        )}
                      </div>
                      {p.price && (
                        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          ₹{Number(p.price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {p.description || 'Turnkey hardware DIY kit with comprehensive BOM components.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/projects/${p._id}`)}
                    className="w-full justify-center gap-1.5"
                  >
                    <span>View Schematic, Pinout & BOM</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
