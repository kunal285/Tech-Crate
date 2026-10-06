import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, Code, Layers } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-8 space-y-6">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-sm text-cyan-400 font-semibold hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-3xl shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              IoT • Intermediate
            </span>
            <h1 className="text-2xl font-bold text-white mt-2">Smart Home Automation System Kit</h1>
          </div>
          <span className="text-2xl font-extrabold text-emerald-400">₹1,499</span>
        </div>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300">
          <pre>{`// ESP32 Smart Home firmware\n#include <WiFi.h>\n#define RELAY_PIN 12\nvoid setup() { pinMode(RELAY_PIN, OUTPUT); }`}</pre>
        </div>
      </div>
    </div>
  );
}
