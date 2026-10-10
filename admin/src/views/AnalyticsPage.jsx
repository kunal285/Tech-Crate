import React from 'react';
import { BarChart3, TrendingUp, Cpu, PieChart, ArrowUpRight } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AnalyticsPage() {
  const userTrend = [
    { month: 'Jan', users: 200 },
    { month: 'Feb', users: 450 },
    { month: 'Mar', users: 700 },
    { month: 'Apr', users: 950 },
    { month: 'May', users: 1200 },
    { month: 'Jun', users: 1420 },
  ];

  const categoryShare = [
    { name: 'IoT Kits', value: 40, color: '#06b6d4' },
    { name: 'Microcontrollers', value: 25, color: '#3b82f6' },
    { name: 'Sensors', value: 20, color: '#8b5cf6' },
    { name: 'Motors', value: 15, color: '#10b981' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Business Intelligence & Growth</h1>
        <p className="text-sm text-slate-400">Deep analytics on project kit sales, student user growth, and inventory velocity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Line Chart */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Student & Builder Acquisition</h2>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> +610% YoY
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                  }}
                />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Category Share Pie Chart */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white">Revenue Distribution by Domain</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryShare}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-300">
            {categoryShare.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span>{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
