import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, Users, Calendar, ArrowRight, ListTodo, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
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
  DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tasksDialogOpen, setTasksDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [members, setMembers] = useState([]);
  const { token, workspaceId, API_URL, user } = useAuth();
  const navigate = useNavigate();

  // Check if current user is admin
  const isAdmin = members.some(m => m.user_id === user?.id && m.role === 'admin');

  const fetchData = async () => {
    if (!workspaceId) return;

    setLoading(true);
    try {
      const [projectsRes, membersRes] = await Promise.all([
        axios.get(`${API_URL}/api/projects/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/workspaces/${workspaceId}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setProjects(projectsRes.data);
      setMembers(membersRes.data.members || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(
        `${API_URL}/api/projects`,
        { ...newProject, workspace_id: workspaceId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProjects([...projects, response.data]);
      toast.success('Project created successfully!');
      setDialogOpen(false);
      setNewProject({ name: '', description: '' });
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const fetchProjectTasks = async (projectId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/tasks/${workspaceId}?project_id=${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjectTasks(response.data.tasks || []);
    } catch (error) {
      toast.error('Failed to load tasks');
    }
  };

  const handleViewTasks = (project, e) => {
    e.stopPropagation();
    setSelectedProject(project);
    fetchProjectTasks(project.id);
    setTasksDialogOpen(true);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}/api/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjectTasks(projectTasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      ));
      toast.success('Task status updated!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const toggleSubtasks = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleSubtaskToggle = async (taskId, subtaskIndex) => {
    const task = projectTasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) {
      console.error('Task or subtasks not found:', { task, subtaskIndex });
      toast.error('Task not found');
      return;
    }

    const updatedSubtasks = task.subtasks.map((st, idx) =>
      idx === subtaskIndex ? { ...st, completed: !st.completed } : st
    );

    try {
      console.log('Updating subtask:', { taskId, updatedSubtasks });
      const response = await axios.patch(
        `${API_URL}/api/tasks/${taskId}`,
        { subtasks: updatedSubtasks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Subtask update response:', response.data);
      setProjectTasks(projectTasks.map(t =>
        t.id === taskId ? response.data.task : t
      ));
      toast.success('Subtask updated!');
    } catch (error) {
      console.error('Subtask update error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to update subtask';
      console.error('Error detail:', errorMsg);
      toast.error(`Failed to update subtask: ${errorMsg}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-64 bg-white/50 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-white/50 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl" data-testid="projects-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Projects</h1>
          <p className="text-slate-600">Manage your projects and track progress</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white shadow-lg"
              data-testid="create-project-dialog-trigger"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Start a new project to organize your tasks
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name
                </label>
                <Input
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                  data-testid="project-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <Textarea
                  placeholder="Describe your project"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                  data-testid="project-description-input"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white"
                data-testid="create-project-submit-btn"
              >
                Create Project
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 mb-2">
              No projects yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first project to start organizing tasks and collaborating with your team
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Project
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all group"
                data-testid={`project-card-${project.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <FolderKanban className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                  {project.name}
                </h3>
                
                {project.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={(e) => handleViewTasks(project, e)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <ListTodo className="w-4 h-4 mr-2" />
                    View Tasks
                  </Button>
                  <Button
                    onClick={() => navigate(`/app/projects/${project.id}`)}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white"
                  >
                    Open Board
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tasks Dialog */}
      <Dialog open={tasksDialogOpen} onOpenChange={setTasksDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name} - Tasks</DialogTitle>
            <DialogDescription>
              View and update task statuses
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {projectTasks.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No tasks in this project</p>
            ) : (
              projectTasks.map(task => (
                <Card key={task.id} className="p-4 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{task.description}</p>
                      )}
                      {task.assignee && (
                        <div className="flex items-center gap-2 mt-2">
                          <img
                            src={task.assignee.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                            alt={task.assignee.name}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-400">{task.assignee.name}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="capitalize">{task.priority}</Badge>
                  </div>

                  {/* Subtasks Section */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mt-3 mb-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSubtasks(task.id)}
                        className="w-full justify-between p-2 h-auto"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm">
                            {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks completed
                          </span>
                        </div>
                        {expandedTasks[task.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      
                      {expandedTasks[task.id] && (
                        <div className="mt-2 space-y-2 pl-2">
                          {task.subtasks.map((subtask, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-700 rounded">
                              <input
                                type="checkbox"
                                checked={subtask.completed}
                                onChange={() => handleSubtaskToggle(task.id, idx)}
                                className="w-4 h-4 rounded border-slate-300"
                              />
                              <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                {subtask.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {['todo', 'in_progress', 'review', 'done'].map(status => (
                      <Button
                        key={status}
                        size="sm"
                        variant={task.status === status ? "default" : "outline"}
                        onClick={() => handleStatusChange(task.id, status)}
                        className={task.status === status ? "bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white" : ""}
                      >
                        {status.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
