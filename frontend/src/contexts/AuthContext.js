import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [workspaceId, setWorkspaceId] = useState(localStorage.getItem('workspaceId'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Verify token and load user
      axios.get(`${API_URL}/api/workspaces`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        // Extract user info from token (in real app, decode JWT)
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        setLoading(false);
      })
      .catch(() => {
        // Token invalid
        logout();
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email, API_URL });
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      console.log('Login response:', response.data);
      const { access_token, user: userData, workspace_id } = response.data;
      
      setToken(access_token);
      setUser(userData);
      setWorkspaceId(workspace_id);
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('workspaceId', workspace_id);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('Attempting registration with:', { name, email, API_URL });
      const response = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      console.log('Registration response:', response.data);
      const { access_token, user: userData, workspace_id } = response.data;
      
      setToken(access_token);
      setUser(userData);
      setWorkspaceId(workspace_id);
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('workspaceId', workspace_id);
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setWorkspaceId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('workspaceId');
  };

  const switchWorkspace = (newWorkspaceId) => {
    setWorkspaceId(newWorkspaceId);
    localStorage.setItem('workspaceId', newWorkspaceId);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      workspaceId, 
      login, 
      register, 
      logout, 
      switchWorkspace,
      loading,
      API_URL 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
