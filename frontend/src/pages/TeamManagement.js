import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Shield, UserCheck, Clock, UserPlus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

const TeamManagement = () => {
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const { token, workspaceId, API_URL, user } = useAuth();

  // Check if current user is admin
  const isAdmin = members.find(m => m.user_id === user?.id)?.role === 'admin';

  const fetchData = async () => {
    if (!workspaceId) return;
    
    setLoading(true);
    try {
      const [membersRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/api/workspaces/${workspaceId}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/tasks/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setMembers(membersRes.data.members || []);
      setTasks(tasksRes.data.tasks || []);
    } catch (error) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const getMemberStats = (userId) => {
    const memberTasks = tasks.filter(t => t.assignee_id === userId);
    const completed = memberTasks.filter(t => t.status === 'done').length;
    const inProgress = memberTasks.filter(t => t.status === 'in_progress').length;
    const total = memberTasks.length;
    
    return { total, completed, inProgress };
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    setInviting(true);
    
    try {
      await axios.post(
        `${API_URL}/api/workspaces/${workspaceId}/invite?email=${encodeURIComponent(inviteEmail)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Member invited successfully!');
      setDialogOpen(false);
      setInviteEmail('');
      fetchData(); // Refresh members list
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-64 bg-white/50 rounded-xl" />
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/50 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl" data-testid="team-management-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Team Management</h1>
          <p className="text-slate-600 dark:text-slate-400">View team members, assign tasks, and track performance</p>
        </div>
        
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Enter the email of an existing user to invite them to your workspace
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="member@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={inviting}
                  className="w-full bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white"
                >
                  {inviting ? 'Inviting...' : 'Send Invite'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Members</p>
              <h3 className="text-2xl font-bold text-slate-900">{members.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Active Tasks</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {tasks.filter(t => t.status !== 'done').length}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Avg. Tasks/Member</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {members.length > 0 ? Math.round(tasks.length / members.length) : 0}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">Team Members</h2>
        
        <div className="grid gap-4">
          {members.map((member, index) => {
            const stats = getMemberStats(member.user_id);
            const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            
            return (
              <motion.div
                key={member.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={member.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                        alt={member.name}
                        className="w-14 h-14 rounded-full border-2 border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 text-lg">{member.name}</h3>
                          <Badge 
                            variant={member.role === 'admin' ? 'default' : 'secondary'}
                            className={member.role === 'admin' ? 'bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)]' : ''}
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            {member.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Mail className="w-4 h-4" />
                          {member.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                        <div className="text-xs text-slate-600">Total Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                        <div className="text-xs text-slate-600">In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
                        <div className="text-xs text-slate-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
                        <div className="text-xs text-slate-600">Completion</div>
                      </div>
                    </div>
                  </div>

                  {/* Task Progress Bar */}
                  {stats.total > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                        <span>Task Progress</span>
                        <span>{stats.completed} of {stats.total} tasks completed</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] transition-all duration-300"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pending Tasks by Deadline */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Upcoming Deadlines</h2>
        <div className="space-y-3">
          {tasks
            .filter(t => t.status !== 'done' && t.due_date)
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .slice(0, 5)
            .map(task => {
              const assignee = members.find(m => m.user_id === task.assignee_id);
              const daysUntil = Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {assignee && (
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">{task.title}</p>
                      <p className="text-xs text-slate-600">{assignee?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      daysUntil < 0 ? 'text-red-600' : daysUntil < 3 ? 'text-orange-600' : 'text-slate-600'
                    }`}>
                      {daysUntil < 0 ? 'Overdue' : `${daysUntil} days`}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
};

export default TeamManagement;
