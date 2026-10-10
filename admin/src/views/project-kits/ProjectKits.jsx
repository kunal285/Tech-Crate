'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Plus, Layers } from 'lucide-react';
import { projectService } from '../../services/projectService';

export default function ProjectKits() {
  const [kits, setKits] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadKits();
  }, []);

  const loadKits = async () => {
    try {
      const data = await projectService.getProjects();
      setKits(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Turn-key Project Kits</h1>
          <p className="text-sm text-slate-400">Bundle components into complete DIY learning packages</p>
        </div>
        <button
          onClick={() => router.push('/project-kits/create')}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Project Kit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kits.map((k) => (
          <div key={k._id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Kit Box
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{k.title}</h2>
              </div>
              <span className="text-xl font-extrabold text-emerald-400">₹{k.price}</span>
            </div>
            <p className="text-xs text-slate-400">{k.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
