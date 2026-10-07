import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Upload,
  ExternalLink,
  Calendar,
  Layers,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

const LINK_TYPES = [
  { value: 'product', label: 'Product (Product Details Screen)' },
  { value: 'category', label: 'Category (Category Listing)' },
  { value: 'project', label: 'Project Kit (Project Details)' },
  { value: 'search', label: 'Search (Pre-filled Search Query)' },
  { value: 'screen', label: 'App Screen (In-App Tab/Screen)' },
  { value: 'url', label: 'External URL (Web Browser)' },
  { value: 'none', label: 'None (Informational Only)' },
];

const PRESET_CATEGORIES = [
  { id: 'arduino', name: 'Arduino' },
  { id: 'esp32', name: 'ESP32' },
  { id: 'esp8266', name: 'ESP8266' },
  { id: 'raspberry-pi', name: 'Raspberry Pi' },
  { id: 'sensors', name: 'Sensors' },
  { id: 'robotics', name: 'Robotics' },
  { id: 'iot', name: 'IoT' },
  { id: 'power', name: 'Power & Battery' },
  { id: 'displays', name: 'Displays' },
  { id: 'project-kits', name: 'Project Kits' },
];

const PRESET_SCREENS = [
  { id: 'Search', name: 'Search Tab' },
  { id: 'Projects', name: 'Projects Hub' },
  { id: 'Cart', name: 'Shopping Cart' },
  { id: 'Profile', name: 'Customer Profile' },
  { id: 'AIAssistant', name: 'AI Shopping Assistant' },
];

export default function Banners() {
  const [posters, setPosters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form / Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fileInputRef = useRef(null);

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    customText: '',
    subtitle: '',
    badgeText: '',
    buttonText: 'Shop Now',
    buttonLink: '',
    imageUrl: '',
    linkType: 'category',
    linkValue: 'iot',
    displayOrder: 1,
    isActive: true,
    startDate: '',
    endDate: '',
  });

  const fetchPosters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/posters');
      setPosters(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[Fetch Posters Error]', err);
      // Fallback to /admin/banners if /posters error
      try {
        const fallback = await api.get('/admin/banners');
        setPosters(Array.isArray(fallback.data) ? fallback.data : []);
      } catch (fErr) {
        setError('Failed to load posters. Please verify backend connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosters();
  }, []);

  const openCreateModal = () => {
    setEditingPoster(null);
    setFormData({
      title: '',
      customText: '',
      subtitle: '',
      badgeText: '',
      buttonText: 'Shop Now',
      buttonLink: '',
      imageUrl: '',
      linkType: 'category',
      linkValue: 'iot',
      displayOrder: posters.length + 1,
      isActive: true,
      startDate: '',
      endDate: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (poster) => {
    setEditingPoster(poster);
    setFormData({
      title: poster.title || '',
      customText: poster.customText || '',
      subtitle: poster.subtitle || '',
      badgeText: poster.badgeText || '',
      buttonText: poster.buttonText || '',
      buttonLink: poster.buttonLink || '',
      imageUrl: poster.imageUrl || poster.image || '',
      linkType: poster.linkType || 'none',
      linkValue: poster.linkValue || '',
      displayOrder: poster.displayOrder !== undefined ? poster.displayOrder : 0,
      isActive: poster.isActive !== undefined ? poster.isActive : (poster.active !== undefined ? poster.active : true),
      startDate: poster.startDate ? new Date(poster.startDate).toISOString().split('T')[0] : '',
      endDate: poster.endDate ? new Date(poster.endDate).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      uploadData.append('folder', 'posters');

      const res = await api.post('/upload/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: res.data.url }));
        setSuccessMsg('Image uploaded successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('[Upload Error]', err);
      setError(err.response?.data?.message || 'Failed to upload image. You can also paste an image URL directly.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl || !formData.title) {
      setError('Both Poster Image and Internal Title are required.');
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        customText: formData.customText.trim(),
        subtitle: formData.subtitle.trim(),
        badgeText: formData.badgeText.trim(),
        buttonText: formData.buttonText.trim(),
        buttonLink: formData.buttonLink.trim(),
        imageUrl: formData.imageUrl.trim(),
        linkType: formData.linkType,
        linkValue: formData.linkValue.trim(),
        displayOrder: Number(formData.displayOrder) || 0,
        isActive: Boolean(formData.isActive),
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
      };

      if (editingPoster) {
        const id = editingPoster._id || editingPoster.id;
        await api.put(`/posters/${id}`, payload);
        setSuccessMsg('Poster updated successfully!');
      } else {
        await api.post('/posters', payload);
        setSuccessMsg('New promotional poster published!');
      }

      setIsModalOpen(false);
      setEditingPoster(null);
      fetchPosters();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('[Save Poster Error]', err);
      setError(err.response?.data?.message || err.message || 'Error saving poster');
    }
  };

  const handleToggleActive = async (poster) => {
    try {
      const id = poster._id || poster.id;
      const currentStatus = poster.isActive !== undefined ? poster.isActive : poster.active;
      await api.put(`/posters/${id}`, { isActive: !currentStatus });
      fetchPosters();
    } catch (err) {
      console.error('[Toggle Status Error]', err);
      alert('Failed to update poster active state.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posters/${id}`);
      setDeleteConfirmId(null);
      setSuccessMsg('Poster deleted successfully.');
      fetchPosters();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('[Delete Poster Error]', err);
      alert('Failed to delete poster.');
    }
  };

  const handleMoveOrder = async (poster, direction) => {
    const currentIndex = posters.findIndex((p) => (p._id || p.id) === (poster._id || poster.id));
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= posters.length) return;

    const targetPoster = posters[targetIndex];
    try {
      const p1Id = poster._id || poster.id;
      const p2Id = targetPoster._id || targetPoster.id;

      const p1Order = poster.displayOrder !== undefined ? poster.displayOrder : currentIndex;
      const p2Order = targetPoster.displayOrder !== undefined ? targetPoster.displayOrder : targetIndex;

      await api.put('/posters/reorder', {
        items: [
          { id: p1Id, displayOrder: p2Order },
          { id: p2Id, displayOrder: p1Order },
        ],
      });
      fetchPosters();
    } catch (err) {
      console.error('[Reorder Error]', err);
    }
  };

  const activeCount = posters.filter((p) => (p.isActive !== undefined ? p.isActive : p.active)).length;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Promotional Posters & Banners</h1>
              <p className="text-xs text-slate-400">
                Data-driven 16:9 banner carousel in Tech Crate mobile app Home Screen
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPosters}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition flex items-center gap-2 text-xs font-semibold"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Promotional Poster
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/70 border border-rose-700/60 text-rose-200 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Posters</p>
            <h3 className="text-2xl font-bold text-white mt-1">{posters.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live On Mobile</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{activeCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Carousel Mode</p>
            <h3 className="text-sm font-bold text-cyan-300 mt-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              {activeCount > 1 ? 'Auto-Slide Active (4.5s)' : activeCount === 1 ? 'Single Static Poster' : 'Empty (Hidden)'}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Posters Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-sm">Loading promotional posters...</p>
        </div>
      ) : posters.length === 0 ? (
        <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-slate-500">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Promotional Posters Yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload your first promotional banner to display in the Tech Crate mobile app hero carousel.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs rounded-xl inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create First Poster
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posters.map((poster, index) => {
            const id = poster._id || poster.id;
            const isActive = poster.isActive !== undefined ? poster.isActive : poster.active;
            const imgUrl = poster.imageUrl || poster.image;

            return (
              <div
                key={id || index}
                className={`bg-slate-950 border rounded-2xl overflow-hidden shadow-xl transition flex flex-col justify-between ${
                  isActive ? 'border-slate-800 hover:border-cyan-500/50' : 'border-rose-950/40 opacity-70'
                }`}
              >
                <div>
                  {/* Poster Image (16:9 Aspect Ratio) */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden group">
                    <img
                      src={imgUrl}
                      alt={poster.title}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    {/* Poster Custom Text & Button Overlay on Card Image */}
                    {(poster.customText || poster.buttonText || poster.badgeText) && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-3 pt-6 flex flex-col justify-end">
                        {poster.badgeText && (
                          <span className="self-start px-2 py-0.5 rounded bg-orange-500/90 text-white text-[8px] font-extrabold uppercase tracking-wider mb-1">
                            {poster.badgeText}
                          </span>
                        )}
                        {poster.customText && (
                          <h4 className="text-white font-bold text-xs line-clamp-1 drop-shadow">
                            {poster.customText}
                          </h4>
                        )}
                        {poster.buttonText && (
                          <div className="mt-1.5 self-start flex items-center gap-1 px-2.5 py-0.5 bg-cyan-400 text-slate-950 text-[10px] font-bold rounded shadow-sm">
                            <span>{poster.buttonText}</span>
                            <span>→</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md ${
                          isActive
                            ? 'bg-emerald-500/80 text-white border border-emerald-400/40'
                            : 'bg-rose-500/80 text-white border border-rose-400/40'
                        }`}
                      >
                        {isActive ? 'Active' : 'Disabled'}
                      </span>
                      <span className="px-2 py-1 bg-slate-900/80 backdrop-blur-md text-cyan-300 border border-slate-700/60 rounded-full text-[10px] font-semibold">
                        Order #{poster.displayOrder !== undefined ? poster.displayOrder : index + 1}
                      </span>
                    </div>

                    {/* Reorder Buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700/60">
                      <button
                        onClick={() => handleMoveOrder(poster, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-slate-400 text-slate-300"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(poster, 'down')}
                        disabled={index === posters.length - 1}
                        className="p-1 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-slate-400 text-slate-300"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Poster Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-white text-base tracking-tight truncate">{poster.title}</h3>
                      {poster.subtitle && (
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{poster.subtitle}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 font-medium uppercase tracking-wide">
                          {poster.linkType || 'none'}
                        </span>
                        {poster.linkValue && (
                          <span className="text-xs text-slate-400 truncate max-w-[180px]" title={poster.linkValue}>
                            → {poster.linkValue}
                          </span>
                        )}
                        {poster.buttonText && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-cyan-950/70 text-cyan-300 border border-cyan-800/50 font-medium">
                            Btn: "{poster.buttonText}"
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Scheduling info if set */}
                    {(poster.startDate || poster.endDate) && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80 bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-800/30">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {poster.startDate ? new Date(poster.startDate).toLocaleDateString() : 'Now'} -{' '}
                          {poster.endDate ? new Date(poster.endDate).toLocaleDateString() : 'Forever'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 border-t border-slate-900 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => handleToggleActive(poster)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                      isActive
                        ? 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/80 border border-emerald-800/40'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {isActive ? 'Enabled' : 'Disabled'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(poster)}
                      className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-lg transition"
                      title="Edit Poster"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
                      title="Delete Poster"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Delete Promotional Poster?</h3>
              <p className="text-xs text-slate-400 mt-1">
                This action is permanent and will remove the poster from the mobile app banner slider immediately.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-600/30"
              >
                Delete Poster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Poster Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingPoster ? 'Edit Promotional Poster' : 'Create Promotional Poster'}
                </h2>
                <p className="text-xs text-slate-400">
                  Mobile app renders the image in full 16:9 ratio with configured tap navigation.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Internal Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Internal Title (Admin Reference Only) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ESP32 IoT Starter Kit Launch Banner"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Image Upload & URL */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Poster Image (16:9 Recommended) *
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 text-cyan-400" />
                    {isUploading ? 'Uploading Image...' : 'Upload Image File'}
                  </button>

                  <input
                    type="text"
                    required
                    placeholder="Or paste Direct Image URL (https://...)"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Live 16:9 Preview with Custom Text & Button Overlay */}
              {formData.imageUrl && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">Live 16:9 Mobile Banner Preview (with overlay):</span>
                  <div className="aspect-video w-full max-h-56 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-inner group">
                    <img
                      src={formData.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    {/* Live Custom Text & CTA Button Scrim Overlay */}
                    {(formData.customText || formData.subtitle || formData.badgeText || formData.buttonText) && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-4 flex flex-col justify-end">
                        {formData.badgeText && (
                          <span className="self-start px-2 py-0.5 rounded bg-orange-500/90 text-white text-[9px] font-extrabold uppercase tracking-wider mb-1 shadow-sm">
                            {formData.badgeText}
                          </span>
                        )}
                        {formData.customText && (
                          <h4 className="text-white font-extrabold text-sm drop-shadow-md leading-snug">
                            {formData.customText}
                          </h4>
                        )}
                        {formData.subtitle && (
                          <p className="text-slate-200 text-xs drop-shadow leading-snug mt-0.5 line-clamp-1">
                            {formData.subtitle}
                          </p>
                        )}
                        {formData.buttonText && (
                          <div className="mt-2 self-start flex items-center gap-1.5 px-3 py-1 bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg shadow-md shadow-cyan-500/30">
                            <span>{formData.buttonText}</span>
                            <span>→</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-[10px] text-cyan-300 font-mono">
                      16:9 Mobile Ratio
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Poster Overlay Text & CTA Button Section */}
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Custom Poster Text & Action Button (Optional)
                  </h4>
                  <span className="text-[10px] text-slate-400">Renders on top of poster in mobile app</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Headline / Custom Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Build Your First IoT Project"
                      value={formData.customText}
                      onChange={(e) => setFormData({ ...formData, customText: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Badge / Pill Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FEATURED KIT or FLAT 30% OFF"
                      value={formData.badgeText}
                      onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Subtitle / Brief Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Complete kits with ESP32 & sensors"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Button Text (CTA)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Shop Now or Explore Kits"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Button Link / URL Override (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty to use Tap Action below, or enter external URL: https://..."
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    If left blank, the button navigates to the Tap Action / Destination selected below.
                  </p>
                </div>
              </div>

              {/* Navigation Link Type & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Tap Action / Link Type *
                  </label>
                  <select
                    value={formData.linkType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      let defaultVal = '';
                      if (newType === 'category') defaultVal = 'iot';
                      else if (newType === 'screen') defaultVal = 'Projects';
                      setFormData({ ...formData, linkType: newType, linkValue: defaultVal });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {LINK_TYPES.map((lt) => (
                      <option key={lt.value} value={lt.value}>
                        {lt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Destination / Value
                  </label>

                  {formData.linkType === 'category' ? (
                    <select
                      value={formData.linkValue}
                      onChange={(e) => setFormData({ ...formData, linkValue: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      {PRESET_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.id})
                        </option>
                      ))}
                    </select>
                  ) : formData.linkType === 'screen' ? (
                    <select
                      value={formData.linkValue}
                      onChange={(e) => setFormData({ ...formData, linkValue: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      {PRESET_SCREENS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.id})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled={formData.linkType === 'none'}
                      placeholder={
                        formData.linkType === 'product'
                          ? 'Product ID (e.g. 660f...)'
                          : formData.linkType === 'project'
                          ? 'Project Kit ID'
                          : formData.linkType === 'search'
                          ? 'e.g. ESP32 or Arduino'
                          : formData.linkType === 'url'
                          ? 'https://techcrate.io/promo'
                          : 'No action on tap'
                      }
                      value={formData.linkValue}
                      onChange={(e) => setFormData({ ...formData, linkValue: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 disabled:opacity-40"
                    />
                  )}
                </div>
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Display Order (1 = first)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Active Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition ${
                      formData.isActive
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {formData.isActive ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" /> Active (Visible in App)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-slate-500" /> Inactive (Hidden)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Scheduling (Optional) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm rounded-xl border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/20"
                >
                  {editingPoster ? 'Update Poster' : 'Publish Poster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
