'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, ShieldAlert, ArrowLeft, PackageCheck } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function ProductApproval() {
  const router = useRouter();

  const [pendingProducts, setPendingProducts] = useState([
    { _id: 'pa1', title: 'STM32F103C8T6 Blue Pill Board', seller: 'Embedded Micro Hub', price: 299, category: 'Microcontrollers' },
    { _id: 'pa2', title: 'VL53L0X Time-of-Flight Distance Sensor', seller: 'IoT Sensor World', price: 349, category: 'Sensors' },
  ]);

  const handleApprove = (id) => {
    setPendingProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const handleReject = (id) => {
    setPendingProducts((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Pending Product Approvals"
        subtitle="Audit hardware specifications, HSN codes, and pricing submitted by third-party sellers"
        breadcrumbs={[{ label: 'Catalog', href: '/products' }, { label: 'Approvals' }]}
        action={
          <Button
            variant="outline"
            size="md"
            onClick={() => router.push('/products')}
            icon={ArrowLeft}
          >
            Back to Products
          </Button>
        }
      />

      {/* Grid */}
      {pendingProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            icon={PackageCheck}
            title="All submissions reviewed"
            description="There are currently no seller product listings awaiting catalog approval."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingProducts.map((p) => (
            <Card
              key={p._id}
              className="p-5 sm:p-6 space-y-4 hover:border-brand-primary/40 dark:hover:border-blue-500/40 transition-colors"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <Badge variant="primary" size="sm" className="mb-2">
                    {p.category}
                  </Badge>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Vendor: <strong className="text-slate-700 dark:text-slate-300">{p.seller}</strong>
                  </p>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base tabular-nums">
                  ₹{p.price}
                </span>
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApprove(p._id)}
                  icon={Check}
                  className="flex-1 justify-center bg-emerald-600 hover:bg-emerald-700"
                >
                  Approve Listing
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleReject(p._id)}
                  icon={X}
                  className="flex-1 justify-center"
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
