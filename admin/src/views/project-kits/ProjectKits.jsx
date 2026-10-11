'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Plus, Layers, RefreshCw, ArrowRight, Edit } from 'lucide-react';
import { projectService } from '../../services/projectService';
import PageHeader from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function ProjectKits() {
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadKits = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setKits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKits();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Turn-key Project Kits"
        subtitle="Bundle components, sensors, and microcontrollers into pre-packaged DIY learning kits"
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Project Kits' }]}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={loadKits}
              loading={loading}
              icon={RefreshCw}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/project-kits/create')}
              icon={Plus}
            >
              Add Project Kit
            </Button>
          </div>
        }
      />

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="w-20 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            </Card>
          ))}
        </div>
      ) : kits.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            icon={Box}
            title="No project kits yet"
            description="Bundle hardware items into complete educational kits for robotics and IoT."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/project-kits/create')}
                icon={Plus}
              >
                Create First Kit
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kits.map((k) => {
            const kitImage =
              (Array.isArray(k.images) && k.images[0]) ||
              k.image ||
              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';

            return (
              <Card
                key={k._id}
                className="p-5 hover:border-brand-primary/40 dark:hover:border-blue-500/40 transition-colors flex flex-col justify-between"
              >
                <div className="flex gap-4 items-start">
                  {/* Kit Box Thumbnail */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={kitImage}
                      alt={k.title}
                      className="w-full h-full object-cover"
                    />
                    {Array.isArray(k.images) && k.images.length > 1 && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[9px] font-bold">
                        +{k.images.length - 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="primary" size="sm">
                          {k.category || 'Turnkey Kit'}
                        </Badge>
                        {k.difficulty && (
                          <Badge variant="neutral" size="sm">
                            {k.difficulty}
                          </Badge>
                        )}
                      </div>
                      {k.price && (
                        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          ₹{Number(k.price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                        {k.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {k.description || 'Pre-bundled hardware package for student learning.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/projects/${k._id}`)}
                    className="flex-1 justify-center gap-1.5"
                  >
                    <span>View Blueprint & BOM</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/projects/${k._id}/edit`)}
                    className="gap-1.5 text-slate-700 dark:text-slate-300 hover:text-brand-primary"
                    title="Edit project kit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
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
