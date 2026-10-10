'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  X,
  Store,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  FileCheck,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import EmptyState from '@/components/ui/EmptyState';
import { sellerService } from '../../services/sellerService';

export default function SellerApprovals() {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [decisionModal, setDecisionModal] = useState({
    open: false,
    seller: null,
    action: 'approve', // 'approve' | 'reject'
    comment: '',
    saving: false,
  });

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const data = await sellerService.getSellers();
      setPendingSellers(data.filter((s) => !s.isApproved));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteDecision = async () => {
    if (!decisionModal.seller) return;
    setDecisionModal((prev) => ({ ...prev, saving: true }));
    try {
      if (decisionModal.action === 'approve') {
        await sellerService.approveSeller(decisionModal.seller._id);
      } else {
        await sellerService.rejectSeller(decisionModal.seller._id);
      }
      setDecisionModal({ open: false, seller: null, action: 'approve', comment: '', saving: false });
      loadSellers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update seller credentials');
      setDecisionModal((prev) => ({ ...prev, saving: false }));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Seller Applications"
        subtitle="Review vendor business credentials, GST numbers, and approve marketplace store registrations"
        icon={Store}
        breadcrumbs={[
          { label: 'Sellers', href: '/sellers' },
          { label: 'Approvals' },
        ]}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/sellers')}
            icon={ArrowLeft}
          >
            Back to Sellers
          </Button>
        }
      />

      {pendingSellers.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={FileCheck}
            title="No pending vendor applications"
            description="All seller onboarding requests have been verified and processed."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingSellers.map((s) => (
            <Card key={s._id} className="p-6 space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-[#032762] dark:text-blue-400">
                    {s.storeName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.email}</span>
                  </div>
                  {s.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Pending Verification
                </span>
              </div>

              {/* Business Credentials Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">GST Identification (GSTIN):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {s.gstNumber || '29AAAAA0000A1Z5'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">PAN Entity:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {s.panNumber || 'AAAAA0000A'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="flex-1"
                  onClick={() =>
                    setDecisionModal({
                      open: true,
                      seller: s,
                      action: 'approve',
                      comment: 'GSTIN and store credentials verified.',
                      saving: false,
                    })
                  }
                  icon={Check}
                >
                  Approve Vendor
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    setDecisionModal({
                      open: true,
                      seller: s,
                      action: 'reject',
                      comment: '',
                      saving: false,
                    })
                  }
                  icon={X}
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      <Modal
        open={decisionModal.open}
        onClose={() => setDecisionModal((prev) => ({ ...prev, open: false }))}
        title={decisionModal.action === 'approve' ? 'Approve Marketplace Vendor' : 'Reject Application'}
        description={`Store: ${decisionModal.seller?.storeName}`}
      >
        <div className="space-y-4 pt-1">
          <Textarea
            label="Verification Notes"
            required={decisionModal.action === 'reject'}
            rows={3}
            placeholder={
              decisionModal.action === 'approve'
                ? 'Optional notes confirming documentation checks...'
                : 'State required reasons why application was rejected (e.g. Invalid GSTIN)...'
            }
            value={decisionModal.comment}
            onChange={(e) => setDecisionModal((prev) => ({ ...prev, comment: e.target.value }))}
          />

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              onClick={() => setDecisionModal((prev) => ({ ...prev, open: false }))}
            >
              Cancel
            </Button>
            <Button
              variant={decisionModal.action === 'approve' ? 'primary' : 'danger'}
              loading={decisionModal.saving}
              disabled={decisionModal.action === 'reject' && !decisionModal.comment.trim()}
              onClick={handleExecuteDecision}
            >
              {decisionModal.action === 'approve' ? 'Confirm Approval' : 'Reject Application'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
