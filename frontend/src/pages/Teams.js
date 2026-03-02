import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Edit2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({ name: '', description: '', member_ids: [] });
  const { token, workspaceId, API_URL } = useAuth();

  const fetchData = useCallback(async () => {
    if (!workspaceId) return;
    
    setLoading(true);
    try {
      const [teamsRes, membersRes] = await Promise.all([
        axios.get(`${API_URL}/api/teams/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/workspaces/${workspaceId}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setTeams(teamsRes.data);
      setMembers(membersRes.data.members || []);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, API_URL, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTeam) {
        await axios.patch(
          `${API_URL}/api/teams/${editingTeam.id}`,
          { ...teamForm, workspace_id: workspaceId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Team updated!');
      } else {
        await axios.post(
          `${API_URL}/api/teams`,
          { ...teamForm, workspace_id: workspaceId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Team created!');
      }
      
      setDialogOpen(false);
      setEditingTeam(null);
      setTeamForm({ name: '', description: '', member_ids: [] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save team');
    }
  };

  const toggleMember = (memberId) => {
    setTeamForm(prev => ({
      ...prev,
      member_ids: prev.member_ids.includes(memberId)
        ? prev.member_ids.filter(id => id !== memberId)
        : [...prev.member_ids, memberId]
    }));
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Teams</h1>
          <p className="text-slate-600 dark:text-slate-400">Organize members into teams and assign projects</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Edit Team' : 'Create Team'}</DialogTitle>
              <DialogDescription>
                {editingTeam ? 'Update team details' : 'Create a new team and add members'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Team Name
                </label>
                <Input
                  placeholder="Engineering Team"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <Textarea
                  placeholder="Team description"
                  value={teamForm.description}
                  onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Team Members
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {members.map(member => (
                    <div key={member.user_id} className="flex items-center gap-2">
                      <Checkbox
                        checked={teamForm.member_ids.includes(member.user_id)}
                        onCheckedChange={() => toggleMember(member.user_id)}
                      />
                      <label className="text-sm text-slate-900 dark:text-slate-100 cursor-pointer">
                        {member.name} ({member.email})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white"
              >
                {editingTeam ? 'Update Team' : 'Create Team'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTeam(team);
                    setTeamForm({
                      name: team.name,
                      description: team.description || '',
                      member_ids: team.members.map(m => m.user_id)
                    });
                    setDialogOpen(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
              
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                {team.name}
              </h3>
              
              {team.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {team.description}
                </p>
              )}
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {team.members.length} members
                </span>
              </div>
              
              <div className="flex -space-x-2 mt-3">
                {team.members.slice(0, 5).map(member => (
                  <img
                    key={member.user_id}
                    src={member.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                    alt={member.name}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800"
                    title={member.name}
                  />
                ))}
                {team.members.length > 5 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                    +{team.members.length - 5}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Teams;
