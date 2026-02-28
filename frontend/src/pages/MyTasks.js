import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Flag, Eye, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';

const statusColumns = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-100' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', label: 'Review', color: 'bg-indigo-100' },
  { id: 'done', label: 'Done', color: 'bg-emerald-100' },
];

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingTask, setViewingTask] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { token, workspaceId, API_URL, user } = useAuth();
  const navigate = useNavigate();

  const fetchMyTasks = async () => {
    if (!workspaceId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/tasks/${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const myTasks = response.data.tasks.filter(t => t.assignee_id === user?.id);
      setTasks(myTasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTasks(tasks.map(t => t.id === taskId ? response.data.task : t));
      if (viewingTask?.id === taskId) {
        setViewingTask(response.data.task);
      }
      toast.success(`Status changed to ${statusColumns.find(s => s.id === newStatus)?.label}`);
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const openViewDialog = (task) => {
    setViewingTask(task);
    setViewDialogOpen(true);
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

  const tasksByStatus = statusColumns.map(status => ({
    ...status,
    tasks: tasks.filter(t => t.status === status.id)
  }));

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">My Tasks</h1>
        <p className="text-slate-600 dark:text-slate-400">Tasks assigned to you across all projects</p>
      </div>

      {tasks.length === 0 ? (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
          <CheckCircle2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No tasks assigned</h3>
          <p className="text-slate-600">You don't have any tasks assigned to you yet.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tasksByStatus.map(column => (
              <Card key={column.id} className="p-4 bg-white/80 backdrop-blur-sm">
                <div className={`${column.color} px-3 py-2 rounded-lg mb-3`}>
                  <h3 className="font-semibold text-slate-900 flex items-center justify-between">
                    {column.label}
                    <Badge variant="secondary">{column.tasks.length}</Badge>
                  </h3>
                </div>
                <div className="space-y-3">
                  {column.tasks.map((task, idx) => {
                    const daysUntil = task.due_date 
                      ? Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24))
                      : null;
                    
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" onClick={() => openViewDialog(task)}>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm line-clamp-2 flex-1">{task.title}</h4>
                            <Eye className="w-4 h-4 text-slate-400 ml-2" />
                          </div>
                          {task.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between text-xs">
                            <Badge variant="outline" className="capitalize">{task.priority}</Badge>
                            {daysUntil !== null && (
                              <div className={`flex items-center gap-1 font-medium ${
                                daysUntil < 0 ? 'text-red-600' : daysUntil < 3 ? 'text-orange-600' : 'text-slate-600'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {daysUntil < 0 ? 'Overdue' : daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* View Task Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {viewingTask && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Title</label>
                <p className="text-slate-900 dark:text-slate-100 font-semibold mt-1">{viewingTask.title}</p>
              </div>
              
              {viewingTask.description && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</label>
                  <p className="text-slate-900 dark:text-slate-100 mt-1">{viewingTask.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Priority</label>
                  <p className="text-slate-900 dark:text-slate-100 mt-1 capitalize">{viewingTask.priority}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                  <p className="text-slate-900 dark:text-slate-100 mt-1 capitalize">{viewingTask.status.replace('_', ' ')}</p>
                </div>
              </div>
              
              {viewingTask.due_date && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Due Date</label>
                  <p className="text-slate-900 dark:text-slate-100 mt-1">{new Date(viewingTask.due_date).toLocaleDateString()}</p>
                </div>
              )}
              
              {viewingTask.subtasks && viewingTask.subtasks.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Subtasks</label>
                  <div className="mt-2 space-y-2">
                    {viewingTask.subtasks.map((subtask, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                        <CheckCircle2 className={`w-4 h-4 ${subtask.completed ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className={`text-sm ${subtask.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Change Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {statusColumns.map(status => (
                    <Button
                      key={status.id}
                      variant={viewingTask.status === status.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange(viewingTask.id, status.id)}
                      className={viewingTask.status === status.id ? "bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white" : ""}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setViewDialogOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyTasks;
