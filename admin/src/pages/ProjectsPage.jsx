import React, { useEffect, useState } from 'react';
import { Cpu, Plus, Code, Layers, Clock, Star, ExternalLink } from 'lucide-react';
import adminApi from '../services/adminApi';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Engineering Project Kits</h1>
          <p className="text-sm text-slate-400">Manage turn-key DIY electronics kits, schematic diagrams, and C++ source code</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((kit) => (
          <div key={kit._id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {kit.category} • {kit.difficulty}
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{kit.title}</h2>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{kit.description}</p>
              </div>
              <span className="text-xl font-extrabold text-emerald-400">₹{kit.price}</span>
            </div>

            {/* Specs bar */}
            <div className="flex items-center gap-4 text-xs text-slate-400 py-3 border-y border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" /> {kit.estimatedTimeHours} Hours Build
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" /> {kit.componentsRequired?.length || 4} Components
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400" /> {kit.rating || 4.9} Rating
              </span>
            </div>

            {/* Bill of materials */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Included Components (BOM):</h3>
              <div className="flex flex-wrap gap-2">
                {kit.componentsRequired?.map((comp, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    {comp.name} (x{comp.quantity})
                  </span>
                ))}
              </div>
            </div>

            {/* Code Snippet Box */}
            {kit.codeSnippet && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-32">
                <pre>{kit.codeSnippet}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
