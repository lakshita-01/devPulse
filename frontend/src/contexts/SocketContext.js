import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { workspaceId, API_URL } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!workspaceId) return;

    const wsUrl = API_URL.replace('/api', '').replace('http', 'ws');
    const newSocket = io(wsUrl, {
      path: `/ws/${workspaceId}`,
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });

    newSocket.on('task_created', (data) => {
      toast.success('New task created', {
        description: data.task?.title
      });
    });

    newSocket.on('task_updated', (data) => {
      if (data.task) {
        toast.info('Task updated', {
          description: data.task.title
        });
      }
    });

    newSocket.on('task_deleted', (data) => {
      toast.info('Task deleted');
    });

    newSocket.on('task_ai_complete', (data) => {
      toast.success('AI subtasks generated!', {
        description: 'Subtasks have been created for your task'
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
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
