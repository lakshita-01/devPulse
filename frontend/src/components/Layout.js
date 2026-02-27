import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import PasswordChangeDialog from './PasswordChangeDialog';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    if (user?.must_change_password) {
      setShowPasswordChange(true);
    }
  }, [user]);

  const handlePasswordChanged = () => {
    // Update user state from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      refreshUser();
    }
    setShowPasswordChange(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>
      <PasswordChangeDialog 
        open={showPasswordChange} 
        onClose={() => {}} 
        onSuccess={handlePasswordChanged}
      />
    </div>
  );
};

export default Layout;
