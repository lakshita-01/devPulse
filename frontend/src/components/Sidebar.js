import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderKanban, 
  BarChart3, 
  Users, 
  UsersRound,
  Settings, 
  ChevronLeft,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
    { icon: FolderKanban, label: 'Projects', path: '/app/projects' },
    { icon: CheckSquare, label: 'My Tasks', path: '/app/my-tasks' },
    { icon: BarChart3, label: 'Analytics', path: '/app/analytics' },
    { icon: UsersRound, label: 'Teams', path: '/app/teams' },
    { icon: Users, label: 'Members', path: '/app/team' },
    { icon: Settings, label: 'Settings', path: '/app/settings' },
  ];

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: open ? 256 : 80 }}
        className="fixed left-0 top-0 h-screen bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 z-50 shadow-xl"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-700">
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div
                  key="logo-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(0,86%,86%)] to-[hsl(177,100%,65%)] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-display font-bold text-lg bg-gradient-to-r from-[hsl(0,86%,56%)] to-[hsl(177,100%,45%)] bg-clip-text text-transparent">
                    DevPulse
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="logo-mini"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(0,86%,86%)] to-[hsl(177,100%,65%)] flex items-center justify-center mx-auto"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
            
            {open && (
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                data-testid="sidebar-collapse-btn"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                              (item.path === '/app/projects' && location.pathname.startsWith('/app/projects/'));
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group",
                    isActive
                      ? "bg-gradient-to-r from-[hsl(0,86%,96%)] to-[hsl(177,100%,95%)] dark:from-[hsl(0,86%,20%)] dark:to-[hsl(177,100%,20%)] text-[hsl(0,86%,56%)] dark:text-[hsl(177,100%,55%)] shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-[hsl(0,86%,96%)] to-[hsl(177,100%,95%)] dark:from-[hsl(0,86%,20%)] dark:to-[hsl(177,100%,20%)] rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cn("w-5 h-5 relative z-10 flex-shrink-0", open ? "" : "mx-auto")} />
                  {open && (
                    <span className="font-medium text-sm relative z-10 whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                alt={user?.name}
                className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 flex-shrink-0"
              />
              {open && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
