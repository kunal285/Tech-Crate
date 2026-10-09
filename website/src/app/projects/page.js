'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Code2, Loader2, Wrench } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

export default function ProjectsHubPage() {
  const [projects, setProjects] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setIsLoading(true);
        const res = await api.get('/projects');
        const list = Array.isArray(res.data) ? res.data : res.data?.projects || [];
        setProjects(list);
      } catch (err) {
        console.error('Failed to load projects:', err);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const filteredProjects =
    selectedDifficulty === 'All'
      ? projects
      : projects.filter(
          (p) => p.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase()
        );

  return (
    <div className="space-y-6 pb-16">
      {/* Hero Header */}
      <div
        className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm border border-slate-200/80 bg-[#032762]"
        style={{ backgroundColor: BRAND.navy }}
      >
        <div className="max-w-2xl space-y-2">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm"
            style={{ backgroundColor: BRAND.orange }}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Open-Source Maker Lab</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            DIY Projects & Code Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-100/90 leading-relaxed font-normal">
            Step-by-step robotics, IoT, and embedded electronics builds. Every project includes
            complete Bill of Materials (BOM), high-res circuit diagrams, and copyable firmware code.
          </p>
        </div>
      </div>

      {/* Difficulty Filter Tabs */}
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 overflow-x-auto scrollbar-none">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 shrink-0">
          Difficulty:
        </span>
        {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
          <button
            key={diff}
            onClick={() => setSelectedDifficulty(diff)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedDifficulty === diff
                ? 'bg-[#032762] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
            style={{
              backgroundColor: selectedDifficulty === diff ? BRAND.navy : undefined,
            }}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[350px]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id || project.id} kit={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm">
          <Wrench className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">No project kits found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Try switching difficulty filters or check back soon for new builds.
          </p>
          <button
            onClick={() => setSelectedDifficulty('All')}
            className="px-4 py-2 rounded-xl bg-[#032762] hover:bg-[#034697] text-white text-xs font-bold transition-all shadow-sm"
            style={{ backgroundColor: BRAND.navy }}
          >
            Show All Projects
          </button>
        </div>
      )}
    </div>
  );
}
