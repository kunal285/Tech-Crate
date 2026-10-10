'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Plus, Layers, RefreshCw } from 'lucide-react';
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
          {kits.map((k) => (
            <Card
              key={k._id}
              className="p-6 space-y-4 hover:border-brand-primary/40 dark:hover:border-blue-500/40 transition-colors"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <Badge variant="primary" size="sm">
                    Kit Box
                  </Badge>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">
                    {k.title}
                  </h3>
                </div>
                {k.price && (
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ₹{Number(k.price).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {k.description || 'Pre-bundled hardware package for student learning.'}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
