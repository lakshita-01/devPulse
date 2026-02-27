import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Bell, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  return (
    <div className="space-y-8 max-w-4xl" data-testid="settings-page">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Settings</h1>
        <p className="text-slate-600">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Profile Information</h2>
        
        <div className="flex items-center gap-6 mb-6">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
            alt={user?.name}
            className="w-20 h-20 rounded-full border-4 border-slate-200"
          />
          <div>
            <h3 className="font-semibold text-lg text-slate-900">{user?.name}</h3>
            <p className="text-slate-600">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                defaultValue={user?.name}
                className="pl-11"
                disabled
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="email"
                defaultValue={user?.email}
                className="pl-11"
                disabled
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Preferences</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Notifications</p>
                <p className="text-sm text-slate-600">Receive task updates and mentions</p>
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Security</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Change Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="password"
                placeholder="Enter new password"
                className="pl-11"
                disabled
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Password management coming soon</p>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 bg-red-50 border-red-200">
        <h2 className="font-display text-xl font-bold text-red-900 mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-red-900">Log Out</p>
            <p className="text-sm text-red-700">Sign out from your account</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
