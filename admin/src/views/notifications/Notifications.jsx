import React, { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle2, Trash2, Clock, Users } from 'lucide-react';
import api from '../../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[AdminNotifications] Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !body) return;
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
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Push Notification Broadcast</h1>
        <p className="text-sm text-slate-400">Send push alerts and in-app announcements to mobile users</p>
      </div>

      {sentSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <form onSubmit={handleSend} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Notification Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Back in Stock: ESP32 Dev Boards!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Message Body</label>
          <textarea
            required
            rows={3}
            placeholder="High-demand ESP32 dual-core microcontrollers are restocked. Order now!"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Target Audience</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Registered Mobile Users</option>
            <option value="customers">Customers Only</option>
            <option value="sellers">Verified Sellers Only</option>
            <option value="students">Students Only</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
        >
          {sending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              Broadcasting...
            </span>
          ) : (
            <>
              <Send className="w-4 h-4" /> Broadcast Notification
            </>
          )}
        </button>
      </form>

      {/* Sent History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Broadcast History</h2>
          <span className="text-xs text-slate-400">{notifications.length} announcements</span>
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 text-sm">
            No notifications broadcasted yet.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id || n.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm">{n.title}</h3>
                  <p className="text-xs text-slate-300 mt-0.5 whitespace-pre-wrap">{n.body}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Target: {n.target}
                    </span>
                    {n.createdAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {new Date(n.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(n._id || n.id)}
                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Delete Announcement"
                aria-label="Delete Announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

