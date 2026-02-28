import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  Zap, 
  Plus,
  TrendingUp,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({ icon: Icon, label, value, change, color }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-lg"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-600 font-medium mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        {change && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-500">{change}</span>
          </div>
        )}
      </div>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, workspaceId, API_URL, user } = useAuth();
  const navigate = useNavigate();

  const fetchAnalytics = async () => {
    if (!workspaceId) return;
    
    setLoading(true);
    try {
      const [analyticsRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/api/analytics/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/tasks/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setAnalytics(analyticsRes.data);
      
      // Filter tasks assigned to current user
      const userTasks = tasksRes.data.tasks.filter(t => t.assignee_id === user?.id);
      setMyTasks(userTasks);
    } catch (error) {
      toast.error('Failed to load analytics');
      console.error(error);
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/50 rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-96 bg-white/50 rounded-2xl" />
          <div className="h-96 bg-white/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  const lineChartData = {
    labels: analytics?.weekly_data?.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }) || [],
    datasets: [
      {
        label: 'Tasks Completed',
        data: analytics?.weekly_data?.map(d => d.completed) || [],
        borderColor: 'hsl(0, 86%, 66%)',
        backgroundColor: 'hsla(0, 86%, 66%, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'hsl(0, 86%, 66%)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const doughnutData = {
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
      legend: {
        display: false,
      },
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
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
        border: {
          display: false,
        },
        ticks: {
          stepSize: 1,
        },
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
    <div className="space-y-8 max-w-7xl" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Welcome back 👋
          </h1>
          <p className="text-slate-600">Here's what's happening with your projects today</p>
        </div>
        <Button
          onClick={() => navigate('/app/projects')}
          className="bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white shadow-lg"
          data-testid="create-project-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={CheckCircle2}
          label="Completed Tasks"
          value={analytics?.completed_tasks || 0}
          change="+12% from last week"
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={analytics?.tasks_by_status?.in_progress || 0}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Review"
          value={analytics?.tasks_by_status?.review || 0}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <StatCard
          icon={Zap}
          label="Completion Rate"
          value={`${completionRate}%`}
          change="+5% this month"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100">Weekly Progress</h3>
              <p className="text-sm text-slate-600 mt-1">Tasks completed over the last 7 days</p>
            </div>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </Card>

        {/* Doughnut Chart */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="mb-6">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100">Task Distribution</h3>
            <p className="text-sm text-slate-600 mt-1">Tasks by status</p>
          </div>
          <div className="h-64">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </Card>
      </div>

      {/* My Tasks Section */}
      {myTasks.length > 0 && (
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100">My Tasks</h3>
            <Badge variant="secondary">{myTasks.length} tasks</Badge>
          </div>
          <div className="space-y-3">
            {myTasks.slice(0, 5).map(task => {
              const daysUntil = task.due_date 
                ? Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24))
                : null;
              
              return (
                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'done' ? 'bg-emerald-500' :
                      task.status === 'in_progress' ? 'bg-blue-500' :
                      task.status === 'review' ? 'bg-indigo-500' : 'bg-slate-400'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">{task.title}</p>
                      <p className="text-xs text-slate-600 capitalize">{task.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {task.priority && (
                      <Badge variant="outline" className="text-xs mb-1">
                        {task.priority}
                      </Badge>
                    )}
                    {daysUntil !== null && (
                      <div className={`text-xs font-semibold ${
                        daysUntil < 0 ? 'text-red-600' : daysUntil < 3 ? 'text-orange-600' : 'text-slate-600'
                      }`}>
                        {daysUntil < 0 ? 'Overdue' : daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {myTasks.length > 5 && (
            <Button
              variant="ghost"
              className="w-full mt-3"
              onClick={() => navigate('/app/projects')}
            >
              View all {myTasks.length} tasks
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </Card>
      )}

      {/* Team Workload */}
      {analytics?.workload && analytics.workload.length > 0 && (
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 mb-4">Team Workload</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.workload.map((member, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <img
                  src={member.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                  alt={member.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{member.name}</p>
                  <p className="text-sm text-slate-600">{member.tasks} active tasks</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6 bg-gradient-to-br from-[hsl(0,86%,96%)] to-[hsl(177,100%,95%)] border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 mb-2">
              Ready to boost productivity?
            </h3>
            <p className="text-slate-700">
              Create a new project or explore AI-powered insights
            </p>
          </div>
          <Button
            onClick={() => navigate('/app/analytics')}
            variant="outline"
            className="border-slate-300 bg-white/80 hover:bg-white dark:border-slate-600 dark:bg-slate-800/80 dark:hover:bg-slate-700"
            data-testid="view-analytics-btn"
          >
            View Analytics
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
