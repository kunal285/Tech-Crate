import React, { useState, useEffect } from 'react';
import { Image, Plus, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchBanners = async () => {
    try {
      const res = await api.get('/admin/banners');
      setBanners(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !imageUrl) return;
    try {
      await api.post('/admin/banners', { title, subtitle, image: imageUrl });
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      fetchBanners();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Promotional Banners</h1>
        <p className="text-sm text-slate-400">Manage hero slider banners displayed in Customer Mobile App</p>
      </div>

      <form onSubmit={handleCreate} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 max-w-xl">
        <input
          type="text"
          placeholder="Banner Main Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
        />
        <input
          type="text"
          placeholder="Subtitle / Offer details"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Publish Hero Banner
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b._id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <img src={b.image} alt={b.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h2 className="font-bold text-white text-base">{b.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{b.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
