import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Lock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const PasswordChangeDialog = ({ open, onClose, onSuccess }) => {
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { token, API_URL } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwords.new_password !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/auth/change-password`,
        { old_password: passwords.old_password, new_password: passwords.new_password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update user in localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        userData.must_change_password = false;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      toast.success('Password changed successfully!');
      setPasswords({ old_password: '', new_password: '', confirm: '' });
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            You must change your password before continuing
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Current Password
            </label>
            <Input
              type="password"
              value={passwords.old_password}
              onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              New Password
            </label>
            <Input
              type="password"
              value={passwords.new_password}
              onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[hsl(0,86%,66%)] to-[hsl(177,100%,55%)] text-white"
          >
            <Lock className="w-4 h-4 mr-2" />
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordChangeDialog;
