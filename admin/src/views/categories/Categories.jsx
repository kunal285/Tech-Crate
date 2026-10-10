'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Layers, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.post('/admin/categories', { name: newCatName });
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Hardware Categories Management</h1>
        <p className="text-sm text-slate-400">Organize electronics components, boards, and engineering kits</p>
      </div>

      {/* Add Form */}
      <form onSubmit={handleCreate} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex gap-4 max-w-xl">
        <input
          type="text"
          placeholder="New Category Name (e.g. Passives & Resistors)"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-sm rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </form>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base">{cat.name}</h2>
                <p className="text-xs text-slate-400">{cat.count || 24} items listed</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
