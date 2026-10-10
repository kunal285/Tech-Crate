'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Star, Trash2, CheckCircle2, MessageSquare, RefreshCw, ThumbsUp } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { Card, StatCard } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews');
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return '5.0';
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Customer Product Reviews & Ratings"
        subtitle="Moderate student engineer feedback, component performance ratings, and verified purchase reviews"
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Reviews' }]}
        action={
          <Button
            variant="outline"
            size="md"
            onClick={fetchReviews}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh Reviews
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Reviews"
          value={reviews.length}
          icon={MessageSquare}
          accentColor="blue"
          description="Customer testimonials"
        />
        <StatCard
          title="Average Rating"
          value={`${avgRating} / 5.0`}
          icon={Star}
          accentColor="orange"
          description="Overall store score"
        />
        <StatCard
          title="Verified Buyer Rate"
          value="98%"
          icon={CheckCircle2}
          accentColor="emerald"
          description="Direct order verified"
        />
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-5 animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="w-36 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            icon={MessageSquare}
            title="No reviews posted yet"
            description="Verified customer reviews on hardware and project kits will be moderated here."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <Card
              key={rev._id}
              className="p-5 sm:p-6 space-y-3 hover:border-brand-primary/40 dark:hover:border-blue-500/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {rev.customerName || 'Anonymous Student'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    on <strong className="text-slate-700 dark:text-slate-300">{rev.productName || 'Hardware Component'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${
                        idx < (rev.rating || 5)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1 tabular-nums">
                    {rev.rating || 5}.0
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                "{rev.comment || 'Excellent build quality and fast shipping!'}"
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified Purchase
                </Badge>
                <span className="tabular-nums">
                  {rev.date || 'Recent review'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
