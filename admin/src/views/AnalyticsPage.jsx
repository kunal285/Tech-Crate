'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  PieChart as PieChartIcon,
  ArrowUpRight,
  Users,
  DollarSign,
  Package,
  Layers,
} from 'lucide-react';
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
  BarChart,
  Bar,
} from 'recharts';
import PageHeader from '../components/PageHeader';
import { Card, StatCard } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function AnalyticsPage() {
  const userTrend = [
    { month: 'Jan', users: 200, revenue: 145000 },
    { month: 'Feb', users: 450, revenue: 280000 },
    { month: 'Mar', users: 700, revenue: 410000 },
    { month: 'Apr', users: 950, revenue: 590000 },
    { month: 'May', users: 1200, revenue: 780000 },
    { month: 'Jun', users: 1420, revenue: 940000 },
  ];

  const categoryShare = [
    { name: 'IoT & Dev Kits', value: 40, color: 'var(--chart-1, #2563EB)' },
    { name: 'Microcontrollers', value: 25, color: 'var(--chart-2, #F97316)' },
    { name: 'Sensors & Modules', value: 20, color: 'var(--chart-3, #02C9CC)' },
    { name: 'Robotics & Motors', value: 15, color: 'var(--chart-4, #7C3AED)' },
  ];

  const velocityData = [
    { category: 'ESP32 / ESP8266', sales: 480 },
    { category: 'Raspberry Pi', sales: 310 },
    { category: 'Arduino Uno R4', sales: 290 },
    { category: 'LiPo Batteries', sales: 220 },
    { category: 'Ultrasonic Sensors', sales: 180 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Business Intelligence & Performance"
        subtitle="Hardware velocity, student maker acquisition curves, and domain revenue splits"
        breadcrumbs={[{ label: 'Overview' }, { label: 'Analytics' }]}
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenue Run Rate"
          value="₹9.40L"
          change="+34.2%"
          trend="up"
          icon={TrendingUp}
          accentColor="blue"
          description="Monthly hardware run rate"
        />
        <StatCard
          title="Student Builders"
          value="1,420"
          change="+610%"
          trend="up"
          icon={Users}
          accentColor="cyan"
          description="Verified collegiate makers"
        />
        <StatCard
          title="Top Category"
          value="IoT & Dev Kits"
          icon={Cpu}
          accentColor="purple"
          description="40% of marketplace GMV"
        />
        <StatCard
          title="Replacement Rate"
          value="0.8%"
          change="-0.4%"
          trend="up"
          icon={Package}
          accentColor="emerald"
          description="Well below 2% SLA threshold"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Line Chart */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Student & Builder Acquisition
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified college makers joining platform monthly
              </p>
            </div>
            <Badge variant="success" size="sm">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +610% YoY
            </Badge>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis
                  dataKey="month"
                  className="text-xs fill-slate-500 dark:fill-slate-400"
                  tickLine={false}
                />
                <YAxis
                  className="text-xs fill-slate-500 dark:fill-slate-400"
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #0F172A)',
                    borderColor: 'var(--tooltip-border, #334155)',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#2563EB' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Product Category Share Pie Chart */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Revenue Distribution by Domain
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contribution percentage across electronics hardware sectors
            </p>
          </div>
          <div className="h-64 sm:h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryShare}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #0F172A)',
                    borderColor: 'var(--tooltip-border, #334155)',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
            {categoryShare.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Component Velocity Bar Chart */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Top Component Dispatch Velocity
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Units fulfilled in the last 30 operational days
          </p>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis
                dataKey="category"
                className="text-xs fill-slate-500 dark:fill-slate-400"
                tickLine={false}
              />
              <YAxis
                className="text-xs fill-slate-500 dark:fill-slate-400"
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #0F172A)',
                  borderColor: 'var(--tooltip-border, #334155)',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="sales" fill="#02C9CC" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
