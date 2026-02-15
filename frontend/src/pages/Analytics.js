import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, Zap } from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, workspaceId, API_URL } = useAuth();

  const fetchAnalytics = async () => {
    if (!workspaceId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/analytics/${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-64 bg-white/50 rounded-xl" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/50 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const weeklyChartData = {
    labels: analytics?.weekly_data?.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Completed Tasks',
        data: analytics?.weekly_data?.map(d => d.completed) || [],
        backgroundColor: 'hsla(0, 86%, 66%, 0.8)',
        borderColor: 'hsl(0, 86%, 66%)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const priorityData = {
    labels: Object.keys(analytics?.tasks_by_priority || {}),
    datasets: [
      {
        data: Object.values(analytics?.tasks_by_priority || {}),
        backgroundColor: [
          'hsl(220, 13%, 69%)',
          'hsl(217, 91%, 60%)',
          'hsl(239, 84%, 67%)',
          'hsl(0, 86%, 66%)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const statusData = {
    labels: Object.keys(analytics?.tasks_by_status || {}),
    datasets: [
      {
        data: Object.values(analytics?.tasks_by_status || {}),
        backgroundColor: [
          'hsl(220, 13%, 69%)',
          'hsl(217, 91%, 60%)',
          'hsl(239, 84%, 67%)',
          'hsl(142, 71%, 45%)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#0f172a',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
      },
      y: {
        grid: { color: '#f1f5f9' },
        border: { display: false },
        ticks: { stepSize: 1 },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
    },
    cutout: '70%',
  };

  const completionRate = analytics?.total_tasks > 0
    ? Math.round((analytics.completed_tasks / analytics.total_tasks) * 100)
    : 0;

  return (
    <div className="space-y-8 max-w-7xl" data-testid="analytics-page">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-slate-900 mb-2">Analytics & Insights</h1>
        <p className="text-slate-600">Track your team's performance and productivity metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Total Tasks</p>
              <h3 className="text-3xl font-bold text-slate-900">{analytics?.total_tasks || 0}</h3>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-500 to-slate-600">
              <Target className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Completed</p>
              <h3 className="text-3xl font-bold text-slate-900">{analytics?.completed_tasks || 0}</h3>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-500">+{completionRate}%</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">In Progress</p>
              <h3 className="text-3xl font-bold text-slate-900">{analytics?.tasks_by_status?.in_progress || 0}</h3>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
              <Clock className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium mb-1">Velocity</p>
              <h3 className="text-3xl font-bold text-slate-900">{completionRate}%</h3>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600">
              <Zap className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart - Weekly Progress */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
          <h3 className="font-display font-bold text-xl text-slate-900 mb-1">Weekly Task Completion</h3>
          <p className="text-sm text-slate-600 mb-6">Tasks completed over the last 7 days</p>
          <div className="h-72">
            <Bar data={weeklyChartData} options={chartOptions} />
          </div>
        </Card>

        {/* Doughnut Chart - Status Distribution */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
          <h3 className="font-display font-bold text-xl text-slate-900 mb-1">Task Status Distribution</h3>
          <p className="text-sm text-slate-600 mb-6">Current task breakdown by status</p>
          <div className="h-72">
            <Doughnut data={statusData} options={doughnutOptions} />
          </div>
        </Card>

        {/* Priority Distribution */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
          <h3 className="font-display font-bold text-xl text-slate-900 mb-1">Priority Distribution</h3>
          <p className="text-sm text-slate-600 mb-6">Tasks organized by priority level</p>
          <div className="h-72">
            <Doughnut data={priorityData} options={doughnutOptions} />
          </div>
        </Card>

        {/* Team Workload */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
          <h3 className="font-display font-bold text-xl text-slate-900 mb-1">Team Workload</h3>
          <p className="text-sm text-slate-600 mb-6">Active tasks per team member</p>
          <div className="space-y-3">
            {analytics?.workload?.slice(0, 5).map((member, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <img
                  src={member.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                  alt={member.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-900 text-sm">{member.name}</span>
                    <span className="text-sm font-semibold text-slate-700">{member.tasks} tasks</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] transition-all"
                      style={{ width: `${Math.min((member.tasks / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
