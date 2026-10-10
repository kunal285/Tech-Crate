'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { projectService } from '../../services/projectService';

export default function AddProject() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'IoT',
    difficulty: 'Beginner',
    price: '',
    codeSnippet: '// C++ Firmware Code\nvoid setup() {\n  Serial.begin(115200);\n}\nvoid loop() {}',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await projectService.createProject({
        ...formData,
        price: Number(formData.price),
      });
      router.push('/projects');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <button onClick={() => router.push('/projects')} className="flex items-center gap-2 text-sm text-cyan-400 font-semibold hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Create Engineering Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Project Title</label>
          <input
            type="text"
            required
            placeholder="Smart IoT Plant Watering System"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white"
            >
              <option value="IoT">IoT</option>
              <option value="Robotics">Robotics</option>
              <option value="Embedded Systems">Embedded Systems</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Kit Price (₹)</label>
            <input
              type="number"
              required
              placeholder="1299"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">C++ Firmware Code</label>
          <textarea
            rows={4}
            value={formData.codeSnippet}
            onChange={(e) => setFormData({ ...formData, codeSnippet: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" /> Publish Project Kit
        </button>
      </form>
    </div>
  );
}
