import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { SpinnerLoader } from '../components/Loader';
import { formatCurrency, formatDate } from '../utils/format';
import {
  FiBriefcase,
  FiDollarSign,
  FiClock,
  FiUsers,
  FiTrendingUp,
  FiArrowUpRight,
  FiPlus,
  FiCalendar,
  FiCheckCircle,
  FiActivity
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import toast from 'react-hot-toast';

// Status Color Palette for Pie Chart
const STATUS_COLORS = {
  Active: '#06b6d4',
  Pending: '#f59e0b',
  Completed: '#10b981',
  'On Hold': '#a855f7',
  Cancelled: '#ef4444'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(15, 21, 35, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
          fontSize: '0.85rem'
        }}
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ color: '#34d399', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/summary');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <SpinnerLoader text="Loading analytics & financial data..." size={42} />;
  }

  const stats = data?.stats || {
    activeProjects: 0,
    totalProjects: 0,
    totalClients: 0,
    totalIncome: 0,
    pendingPayments: 0
  };

  const monthlyIncome = data?.monthlyIncome || [];
  const statusBreakdown = (data?.statusBreakdown || []).filter((s) => s.count > 0);
  const recentPayments = data?.recentPayments || [];
  const recentProjects = data?.recentProjects || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Welcome & Quick Action Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h2>Executive Overview</h2>
          <p className="text-secondary text-sm">
            Real-time visual telemetry for your freelance projects, income, and pipelines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/payments" className="btn btn-secondary btn-sm">
            <FiPlus size={15} /> Record Payment
          </Link>
          <Link to="/projects" className="btn btn-primary btn-sm">
            <FiPlus size={15} /> New Project
          </Link>
        </div>
      </div>

      {/* 4 Core Requirement Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          subtitle={`Across ${stats.totalProjects} total engagements`}
          icon={FiBriefcase}
          iconBg="rgba(6, 182, 212, 0.15)"
          iconColor="#06b6d4"
        />

        <StatCard
          title="Total Income Earned"
          value={formatCurrency(stats.totalIncome)}
          subtitle="All-time verified paid payments"
          icon={FiDollarSign}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10b981"
        />

        <StatCard
          title="Pending Receivables"
          value={formatCurrency(stats.pendingPayments)}
          subtitle="Uncollected fees on active work"
          icon={FiClock}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#f59e0b"
        />

        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          subtitle="Network relationships managed"
          icon={FiUsers}
          iconBg="rgba(99, 102, 241, 0.15)"
          iconColor="var(--primary)"
        />
      </div>

      {/* Analytics Charts Section (Bar Chart + Donut Chart) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Monthly Income 12-Month Bar Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Monthly Revenue (Last 12 Months)</h3>
              <p className="text-secondary text-xs">Verified earnings trend over time</p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <FiTrendingUp size={13} />
              <span>Earnings Trend</span>
            </div>
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyIncome} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
                  tickFormatter={(val) => (val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Breakdown Donut/Pie Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Project Status Distribution</h3>
            <p className="text-secondary text-xs">Workload status allocation</p>
          </div>

          <div style={{ width: '100%', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {statusBreakdown.length === 0 ? (
              <div className="text-secondary text-sm" style={{ textAlign: 'center' }}>
                No project data available to plot distribution.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {statusBreakdown.map((entry) => (
                      <Cell
                        key={`cell-${entry.status}`}
                        fill={STATUS_COLORS[entry.status] || '#6366f1'}
                        stroke="rgba(17, 23, 40, 0.8)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 21, 35, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span style={{ color: '#94a3b8', fontSize: '0.825rem' }}>{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Sections (Recent Payments & Active Deliverables) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {/* Recent Payments Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Recent Payment Inflows</h3>
            <Link to="/payments" className="text-secondary text-xs gradient-text font-semibold">
              View All Payments &rarr;
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <p className="text-secondary text-sm" style={{ padding: '1rem 0' }}>
              No payments logged yet.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p) => (
                    <tr key={p._id}>
                      <td className="font-semibold">{p.project?.name || 'Project'}</td>
                      <td className="text-secondary">{p.client?.name || 'Client'}</td>
                      <td
                        className="font-mono font-bold"
                        style={{ color: p.status === 'Paid' ? '#34d399' : '#fbbf24' }}
                      >
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="text-secondary">{formatDate(p.date)}</td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Engagements */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Recent Engagements</h3>
            <Link to="/projects" className="text-secondary text-xs gradient-text font-semibold">
              View All Projects &rarr;
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <p className="text-secondary text-sm" style={{ padding: '1rem 0' }}>
              No projects created yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentProjects.map((pr) => (
                <div
                  key={pr._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <div className="font-semibold text-sm">{pr.name}</div>
                    <div className="text-secondary text-xs">{pr.client?.name || 'Client'}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="font-mono font-semibold text-sm">
                      {formatCurrency(pr.fee)}
                    </span>
                    <StatusBadge status={pr.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
