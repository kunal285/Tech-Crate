'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Users,
  Package,
  Cpu,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Store,
  Layers,
  RotateCcw,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import adminApi from '../services/adminApi';

// Dynamically import Recharts to prevent SSR hydration discrepancies
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const AreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { ssr: false }
);
const Area = dynamic(() => import('recharts').then((mod) => mod.Area), {
  ssr: false,
});
const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), {
  ssr: false,
});
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), {
  ssr: false,
});

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d'); // '7d' | '30d' | 'fy26'

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
        pendingOrders: 0,
        pendingSellerApprovals: 0,
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

  const totalOrders = stats?.totalOrders || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Chart data formatting with safe fallbacks
  const salesChartData =
    stats?.monthlySales && stats.monthlySales.length > 0
      ? stats.monthlySales
      : [
          { month: 'Oct 01', revenue: Math.round(totalRevenue * 0.2), orders: Math.max(1, Math.round(totalOrders * 0.2)) },
          { month: 'Oct 04', revenue: Math.round(totalRevenue * 0.35), orders: Math.max(1, Math.round(totalOrders * 0.4)) },
          { month: 'Oct 07', revenue: Math.round(totalRevenue * 0.25), orders: Math.max(1, Math.round(totalOrders * 0.25)) },
          { month: 'Oct 10', revenue: totalRevenue, orders: totalOrders },
        ];

  const categoryChartData =
    stats?.categoryBreakdown && stats.categoryBreakdown.length > 0
      ? stats.categoryBreakdown
      : [
          { name: 'Microcontrollers', sales: 42 },
          { name: 'Sensors', sales: 38 },
          { name: 'Robotics', sales: 24 },
          { name: 'IoT Modules', sales: 19 },
        ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Command Center Overview"
        subtitle="Operational metrics, sales telemetry, and pending actions across Tech Crate"
        action={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDateRange('7d')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  dateRange === '7d'
                    ? 'bg-brand-primary text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setDateRange('30d')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  dateRange === '30d'
                    ? 'bg-brand-primary text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setDateRange('fy26')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  dateRange === 'fy26'
                    ? 'bg-brand-primary text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                FY 2026
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              loading={loading}
              icon={RefreshCw}
            >
              Refresh Data
            </Button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          change="+18.4%"
          trend="up"
          icon={DollarSign}
          accentColor="emerald"
          description="vs last month"
        />
        <StatCard
          title="Completed Orders"
          value={totalOrders}
          change="+12.1%"
          trend="up"
          icon={ShoppingCart}
          accentColor="blue"
          description="placed by makers"
        />
        <StatCard
          title="Average Order Value"
          value={`₹${aov.toLocaleString('en-IN')}`}
          change="+₹140"
          trend="up"
          icon={TrendingUp}
          accentColor="purple"
          description="AOV per basket"
        />
        <StatCard
          title="Active Hardware SKUs"
          value={stats?.totalProducts || 0}
          change="+8 New"
          trend="neutral"
          icon={Package}
          accentColor="orange"
          description="catalog products"
        />
      </div>

      {/* "Needs Attention" Priority Action Panel */}
      <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-orange-50 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-brand-orange" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Operational Priority Actions
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Live Queue</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Pending Dispatches */}
          <Link
            href="/orders?status=Processing"
            className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-brand-primary dark:hover:border-blue-500 transition-all flex items-center justify-between group shadow-xs"
          >
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Orders Pending Dispatch</span>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                {stats?.pendingOrders || 0}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Pending Seller Approvals */}
          <Link
            href="/sellers/approvals"
            className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-brand-primary dark:hover:border-blue-500 transition-all flex items-center justify-between group shadow-xs"
          >
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Vendor Approvals Awaiting</span>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                {stats?.pendingSellerApprovals || 0}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Replacement Claims */}
          <Link
            href="/replacements"
            className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-brand-primary dark:hover:border-blue-500 transition-all flex items-center justify-between group shadow-xs"
          >
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">7-Day Replacement Claims</span>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                2 Pending
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart */}
        <Card className="lg:col-span-2 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Revenue & Sales Trajectory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gross sales realized from hardware components & maker kits
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-brand-primary dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              INR (₹)
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Bar Chart */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Component Share
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Units ordered by hardware category
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748B" width={95} tick={{ fontSize: 10 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [`${value} Units`, 'Volume']}
                />
                <Bar dataKey="sales" fill="#034697" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
