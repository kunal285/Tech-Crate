import React, { useEffect, useState } from 'react';
import {
  Users,
  Package,
  Cpu,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import adminApi from '../services/adminApi';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalProjects: 0,
        totalOrders: 0,
        totalRevenue: 0,
        monthlySales: [],
        categoryBreakdown: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cardData = [
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      change: '+18.4%',
      icon: DollarSign,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      change: '+12.1%',
      icon: ShoppingCart,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    },
    {
      title: 'Active Hardware Items',
      value: stats?.totalProducts || 0,
      change: '+8 Added',
      icon: Package,
      color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400',
    },
    {
      title: 'Registered Builders',
      value: stats?.totalUsers || 0,
      change: '+240 Users',
      icon: Users,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Command Center</h1>
          <p className="text-sm text-slate-400">Live operational overview for TechCrate e-commerce & project kits</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-gradient-to-br border ${card.color} backdrop-blur-sm relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">{card.value}</div>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
                <span>{card.change} from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Monthly Sales Growth</h2>
              <p className="text-xs text-slate-400">Gross revenue generated from component & kit orders</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              FY 2026
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlySales || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Category Sales</h2>
              <p className="text-xs text-slate-400">Revenue share by hardware category</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoryBreakdown || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="name" type="category" stroke="#64748b" width={90} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
