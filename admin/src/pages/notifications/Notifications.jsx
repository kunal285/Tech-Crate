import React, { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [sentSuccess, setSentSuccess] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !body) return;
    try {
      await api.post('/admin/notifications', { title, body, target });
      setTitle('');
      setBody('');
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 3000);
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Push Notification Broadcast</h1>
        <p className="text-sm text-slate-400">Send Firebase Cloud Messaging (FCM) push alerts to mobile users</p>
      </div>

      {sentSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> Push notification sent to target users!
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
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <Send className="w-4 h-4" /> Broadcast Push Notification
        </button>
      </form>

      {/* Sent History */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">Broadcast History</h2>
        {notifications.map((n) => (
          <div key={n._id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <Bell className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-white text-sm">{n.title}</h3>
              <p className="text-xs text-slate-300 mt-0.5">{n.body}</p>
              <span className="text-xs text-slate-500 mt-2 block">Target: {n.target}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
