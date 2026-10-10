import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Plus, Code, Layers } from 'lucide-react';
import { projectService } from '../../services/projectService';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Engineering Project Hub</h1>
          <p className="text-sm text-slate-400">Manage turn-key DIY electronics kits, schematic diagrams, and C++ source code</p>
        </div>
        <button
          onClick={() => navigate('/projects/create')}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Engineering Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((p) => (
          <div key={p._id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {p.category} • {p.difficulty}
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{p.title}</h2>
              </div>
              <span className="text-lg font-bold text-emerald-400">₹{p.price}</span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
            <button
              onClick={() => navigate(`/projects/${p._id}`)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl"
            >
              View Full Schematic & BOM Details →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
