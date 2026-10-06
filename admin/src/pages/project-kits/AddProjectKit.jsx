import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { projectService } from '../../services/projectService';

export default function AddProjectKit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '', price: '', category: 'IoT' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await projectService.createProject({ ...formData, price: Number(formData.price) });
      navigate('/project-kits');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <button onClick={() => navigate('/project-kits')} className="flex items-center gap-2 text-sm text-cyan-400 font-semibold hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Kits
      </button>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Create Turn-key Kit Package</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kit Title</label>
          <input
            type="text"
            required
            placeholder="Smart Agriculture Kit"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Price (₹)</label>
          <input
            type="number"
            required
            placeholder="1499"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Save Kit
        </button>
      </form>
    </div>
  );
}
