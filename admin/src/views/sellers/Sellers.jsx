'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Store, CheckCircle, Clock, RefreshCw, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { sellerService } from '../../services/sellerService';
import PageHeader from '../../components/PageHeader';
import { Card, StatCard } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadSellers = async () => {
    try {
      setLoading(true);
      const data = await sellerService.getSellers();
      setSellers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const metrics = useMemo(() => {
    const total = sellers.length;
    const verified = sellers.filter((s) => s.isApproved).length;
    const pending = sellers.filter((s) => !s.isApproved).length;
    return { total, verified, pending };
  }, [sellers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Verified Sellers & Stores"
        subtitle="Manage electronics suppliers, component store applications, and marketplace fulfillment"
        breadcrumbs={[{ label: 'Marketplace' }, { label: 'Sellers' }]}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={loadSellers}
              loading={loading}
              icon={RefreshCw}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/sellers/approvals')}
              icon={Clock}
            >
              Pending Approvals ({metrics.pending})
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Vendors"
          value={metrics.total}
          icon={Store}
          accentColor="blue"
          description="Registered storefronts"
        />
        <StatCard
          title="Verified Partners"
          value={metrics.verified}
          icon={ShieldCheck}
          accentColor="emerald"
          description="Active and approved"
        />
        <StatCard
          title="Pending Verification"
          value={metrics.pending}
          icon={Clock}
          accentColor="orange"
          description="Awaiting audit"
        />
      </div>

      {/* Sellers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="w-20 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="w-36 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : sellers.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            icon={Store}
            title="No sellers found"
            description="No vendors are currently registered on the platform."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/sellers/approvals')}
              >
                Check Pending Approvals
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sellers.map((s) => (
            <Card
              key={s._id}
              className="p-6 space-y-4 hover:border-brand-primary/40 dark:hover:border-blue-500/40 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-brand-primary dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Store className="w-6 h-6" />
                  </div>
                  <Badge variant={s.isApproved ? 'success' : 'warning'} size="sm">
                    {s.isApproved ? 'Verified Partner' : 'Pending Audit'}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    {s.storeName || 'Unnamed Hardware Store'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {s.email}
                  </p>
                  <div className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 inline-block">
                    GSTIN: {s.gstNumber || 'Unregistered'}
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/sellers/${s._id}`)}
                className="w-full justify-center gap-1.5"
              >
                <span>View Full Store Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
