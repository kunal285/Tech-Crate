import React, { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/admin/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Customer Product Reviews</h1>
        <p className="text-sm text-slate-400">Moderate product ratings, verified purchase feedback, and reviews</p>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div key={rev._id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-base">{rev.customerName}</span>
                <span className="text-xs text-slate-400 ml-2">on {rev.productName}</span>
              </div>
              <span className="text-amber-400 font-bold text-sm">⭐ {rev.rating}/5</span>
            </div>
            <p className="text-sm text-slate-300 italic">"{rev.comment}"</p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Purchase
              </span>
              <span className="text-slate-500">{rev.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
