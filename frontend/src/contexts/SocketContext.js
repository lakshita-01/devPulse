import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { workspaceId, API_URL } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!workspaceId || !API_URL) return;

    const wsUrl = `${API_URL.replace('http://', 'ws://').replace('https://', 'wss://')}/ws/${workspaceId}`;
    
    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected to', wsUrl);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'task_created') {
            toast.success('New task created', {
              description: data.task?.title
            });
          } else if (data.type === 'task_updated') {
            toast.info('Task updated', {
              description: data.task?.title
            });
          } else if (data.type === 'task_deleted') {
            toast.info('Task deleted');
          } else if (data.type === 'task_ai_complete') {
            toast.success('AI subtasks generated!', {
              description: 'Subtasks have been created for your task'
            });
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      setSocket(ws);

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [workspaceId, API_URL]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
