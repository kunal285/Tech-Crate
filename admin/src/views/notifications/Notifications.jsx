'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle2, Trash2, Clock, Users, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[AdminNotifications] Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      const res = await api.post('/admin/notifications', { title, body, target });
      setTitle('');
      setBody('');
      setFeedbackMsg(res.data?.message || 'Notification broadcasted and saved successfully!');
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 4000);
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this broadcast notification?')) return;
    try {
      await api.delete(`/admin/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <PageHeader
        title="Push Notification Broadcast"
        subtitle="Dispatch immediate push alerts and in-app updates to student makers and hardware sellers"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'Notifications' }]}
        action={
          <Button
            variant="outline"
            size="md"
            onClick={fetchNotifications}
            loading={loading}
            icon={RefreshCw}
          >
            Refresh
          </Button>
        }
      />

      {sentSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{feedbackMsg}</span>
        </div>
      )}

      {/* Broadcast Form Card */}
      <Card className="p-6 sm:p-7 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-primary dark:text-blue-400" />
          Compose Broadcast Alert
        </h2>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Notification Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Back in Stock: ESP32 Dual-Core Microcontrollers!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Message Body *
            </label>
            <textarea
              required
              rows={3}
              placeholder="High-demand ESP32-WROOM boards are restocked at student discounted pricing. Fast dispatch available!"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Target Audience
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary cursor-pointer transition-all"
            >
              <option value="all">All Registered Mobile App Users</option>
              <option value="customers">Customers / Student Makers Only</option>
              <option value="sellers">Verified Hardware Sellers Only</option>
              <option value="students">Collegiate Student Makers Only</option>
            </select>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={sending}
              icon={Send}
              className="w-full justify-center"
            >
              Broadcast Notification
            </Button>
          </div>
        </form>
      </Card>

      {/* Broadcast History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Broadcast History
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {notifications.length} announcements
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded" />
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-10 text-center">
            <EmptyState
              icon={Bell}
              title="No broadcast notifications yet"
              description="Announcements sent to the mobile app will be logged here."
            />
          </Card>
        ) : (
          notifications.map((n) => (
            <Card
              key={n._id || n.id}
              className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:border-brand-primary/30 dark:hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-brand-primary dark:text-blue-400 shrink-0 mt-0.5">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {n.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap">
                    {n.body}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5" /> Target: {n.target}
                    </span>
                    {n.createdAt && (
                      <span className="flex items-center gap-1 tabular-nums">
                        <Clock className="w-3.5 h-3.5" /> {new Date(n.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(n._id || n.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                title="Delete Announcement"
                aria-label="Delete Announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
