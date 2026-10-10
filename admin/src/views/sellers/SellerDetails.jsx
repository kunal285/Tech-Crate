'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Store, ShieldCheck, DollarSign, Package } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { Card, StatCard } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function SellerDetails() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <PageHeader
        title="Store Profile & Vendor Dossier"
        subtitle={`Audit details and verification credentials for vendor ID: ${id}`}
        breadcrumbs={[{ label: 'Marketplace', href: '/sellers' }, { label: 'Store Dossier' }]}
        action={
          <Button
            variant="outline"
            size="md"
            onClick={() => router.push('/sellers')}
            icon={ArrowLeft}
          >
            Back to Sellers
          </Button>
        }
      />

      {/* Profile Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-brand-primary dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                RoboTech Components Store
              </h2>
              <Badge variant="success" size="sm">
                Verified Partner
              </Badge>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
              GSTIN: 27AAAAA0000A1Z5
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
              Total Fulfillments Revenue
            </span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xl tabular-nums">
              ₹1,54,000
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
              Active Hardware Catalog Items
            </span>
            <span className="font-extrabold text-brand-primary dark:text-blue-400 text-xl tabular-nums">
              18 SKUs
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
