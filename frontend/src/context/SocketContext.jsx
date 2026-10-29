import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Connect to the backend server (strip /api if present so it connects to root socket.io)
      const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const socketUrl = rawUrl.replace(/\/api\/?$/, '');
      const newSocket = io(socketUrl, {
        reconnectionAttempts: 5,
        timeout: 10000
      });
      setSocket(newSocket);

      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
