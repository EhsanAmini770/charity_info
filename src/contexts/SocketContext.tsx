
import React, { createContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from "@/components/ui/use-toast";
import API_CONFIG from '../config/api';
import { logError, logInfo } from '@/utils/logUtils';

// Create a socket instance with proper error handling
export const socket = io(API_CONFIG.baseURL, {
  autoConnect: false, // Don't auto connect, we'll handle this manually
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 10000,
  withCredentials: true,
});

// Create a context with the socket and online count
interface SocketContextValue {
  socket: Socket;
  onlineCount: number;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextValue>({
  socket,
  onlineCount: 0,
  isConnected: false
});

// Provider component
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { toast } = useToast();
  const errorCountRef = useRef(0);
  const hasShownToastRef = useRef(false);
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Log connection status
  useEffect(() => {
    // Try to connect with a small delay
    connectTimeoutRef.current = setTimeout(() => {
      try {
        socket.connect();
      } catch (error) {
        logError('Failed to initialize socket connection', error);
      }
    }, 1000);

    socket.on('connect', () => {
      logInfo('Socket connected successfully');
      setIsConnected(true);
      // Reset error count on successful connection
      errorCountRef.current = 0;
      hasShownToastRef.current = false;
    });

    socket.on('connect_error', (error) => {
      logError('Socket connection error', error);
      setIsConnected(false);

      // Increment error count
      errorCountRef.current += 1;

      // Only show toast after multiple connection failures and if not shown yet
      if (errorCountRef.current > 3 && !hasShownToastRef.current) {
        toast({
          title: "Connection Notice",
          description: "Real-time updates are not available. The application will continue to work normally.",
          variant: "default"
        });
        hasShownToastRef.current = true;
      }
    });

    socket.on('disconnect', (reason) => {
      logInfo('Socket disconnected', { reason });
      setIsConnected(false);
    });

    socket.on('onlineCount', (data: { count: number }) => {
      setOnlineCount(data.count);
    });

    return () => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
      }
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('onlineCount');
      socket.disconnect();
    };
  }, [toast]);

  return (
    <SocketContext.Provider value={{ socket, onlineCount, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook for convenient socket access
export const useSocket = () => {
  return React.useContext(SocketContext);
};
