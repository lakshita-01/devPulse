import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  User,
  Calendar,
  Flag,
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';

const statusColumns = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-100 dark:bg-slate-700' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'review', label: 'Review', color: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { id: 'done', label: 'Done', color: 'bg-emerald-100 dark:bg-emerald-900/30' },
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-slate-500' },
  { value: 'medium', label: 'Medium', color: 'text-blue-500' },
  { value: 'high', label: 'High', color: 'text-indigo-500' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
];

const TaskCard = ({ task, onUpdate, onDelete, members }) => {
  const priorityColor = priorityOptions.find(p => p.value === task.priority)?.color || '';
  const assignee = task.assignee;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="p-4 bg-white hover:shadow-md transition-all cursor-move group" data-testid={`task-card-${task.id}`}>
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 flex-1">{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdate(task)}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <p className="text-xs text-slate-600 mb-3 line-clamp-2">{task.description}</p>
        )}

        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mb-3 p-2 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks</span>
              {task.ai_generated && <Sparkles className="w-3 h-3 text-indigo-500 ml-1" />}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Flag className={`w-3 h-3 ${priorityColor}`} />
            {assignee && (
              <img
                src={assignee.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                alt={assignee.name}
                className="w-6 h-6 rounded-full border-2 border-white"
                title={assignee.name}
              />
            )}
          </div>
          {task.due_date && (
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

const KanbanBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { token, workspaceId, API_URL } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee_id: '',
    due_date: '',
    generate_ai: false
  });

  const fetchTasks = async () => {
    if (!projectId || !workspaceId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/tasks/${workspaceId}?project_id=${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(response.data.tasks || []);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!workspaceId) return;
    
    try {
      const response = await axios.get(
        `${API_URL}/api/workspaces/${workspaceId}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Failed to load members');
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    const taskData = {
      ...taskForm,
      project_id: projectId,
      workspace_id: workspaceId,
      due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : null,
    };

    // AI Generation
    if (taskForm.generate_ai && taskForm.title) {
      setAiLoading(true);
      try {
        // Use puter.js for AI subtask generation
        const prompt = `Break down this task into 3-5 actionable subtasks:\n\nTask: ${taskForm.title}${taskForm.description ? `\nDescription: ${taskForm.description}` : ''}\n\nReturn only a JSON array of subtasks in this format: [{"title": "subtask 1", "completed": false}]`;
        
        const response = await window.puter.ai.chat(prompt, {
          model: 'gpt-4o-mini',
        });
        
        // Parse AI response
        try {
          const content = response.message?.content || response;
          const jsonMatch = content.match(/\[.*\]/s);
          if (jsonMatch) {
            const subtasks = JSON.parse(jsonMatch[0]);
            taskData.subtasks = subtasks;
            toast.success('AI subtasks generated!');
          }
        } catch (err) {
          console.error('Failed to parse AI response:', err);
        }
      } catch (error) {
        console.error('AI generation failed:', error);
        toast.error('AI generation failed, creating task without subtasks');
      } finally {
        setAiLoading(false);
      }
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/tasks`,
        taskData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTasks([...tasks, response.data.task]);
      toast.success('Task created successfully!');
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (updatedData) => {
    if (!editingTask) return;
    
    try {
      const response = await axios.patch(
        `${API_URL}/api/tasks/${editingTask.id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTasks(tasks.map(t => t.id === editingTask.id ? response.data.task : t));
      toast.success('Task updated!');
      setEditingTask(null);
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(
        `${API_URL}/api/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTasks(tasks.map(t => t.id === taskId ? response.data.task : t));
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const openEditDialog = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      assignee_id: task.assignee_id || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      generate_ai: false
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      assignee_id: '',
      due_date: '',
      generate_ai: false
    });
    setEditingTask(null);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6" data-testid="kanban-board-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate('/app/projects')} className="mb-2">
            ← Back to Projects
          </Button>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">Task Board</h1>
        </div>
        
        <Button
          onClick={() => { resetForm(); setDialogOpen(true); }}
          className="bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white"
          data-testid="create-task-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map(column => {
          const columnTasks = tasks.filter(t => t.status === column.id);
          
          return (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.color} px-4 py-3 rounded-t-2xl border-b-2 border-slate-200`}>
                <h3 className="font-semibold text-slate-900 flex items-center justify-between">
                  {column.label}
                  <span className="text-xs bg-white/60 px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </h3>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-b-2xl space-y-3 min-h-[500px]">
                {columnTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={openEditDialog}
                    onDelete={handleDeleteTask}
                    members={members}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update task details' : 'Add a new task to your project'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingTask ? (e) => { e.preventDefault(); handleUpdateTask(taskForm); } : handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Task Title</label>
              <Input
                placeholder="Enter task title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                required
                data-testid="task-title-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <Textarea
                placeholder="Task description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={3}
                data-testid="task-description-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}>
                  <SelectTrigger data-testid="task-priority-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assignee</label>
                <Select value={taskForm.assignee_id} onValueChange={(value) => setTaskForm({ ...taskForm, assignee_id: value })}>
                  <SelectTrigger data-testid="task-assignee-select">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(member => (
                      <SelectItem key={member.user_id} value={member.user_id}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
              <Input
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                data-testid="task-due-date-input"
              />
            </div>

            {!editingTask && (
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[hsl(0,86%,96%)] to-[hsl(177,100%,95%)] rounded-lg">
                <input
                  type="checkbox"
                  id="generate-ai"
                  checked={taskForm.generate_ai}
                  onChange={(e) => setTaskForm({ ...taskForm, generate_ai: e.target.checked })}
                  className="w-4 h-4"
                  data-testid="task-ai-generate-checkbox"
                />
                <label htmlFor="generate-ai" className="text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer">
                  <Sparkles className="w-4 h-4 text-[hsl(0,86%,56%)]" />
                  Generate subtasks with AI
                </label>
              </div>
            )}

            <Button
              type="submit"
              disabled={aiLoading}
              className="w-full bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white"
              data-testid="task-submit-btn"
            >
              {aiLoading ? 'Generating with AI...' : editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanBoard;
