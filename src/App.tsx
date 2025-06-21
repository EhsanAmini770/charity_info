
import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import AppRoutes from './Routes';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from '@/components/utils/ScrollToTop';
import Preload from '@/components/utils/Preload';
import GlobalErrorHandler from '@/components/error/GlobalErrorHandler';
import errorService from '@/services/errorService';

// Create a new QueryClient instance with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch on window focus
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Garbage collection time (formerly cacheTime)
      retry: 1, // Only retry failed requests once
      retryDelay: 3000, // Wait 3 seconds before retrying
    },
  },
});

const App: React.FC = () => {
  // Initialize global error handlers when the app mounts
  useEffect(() => {
    errorService.initializeGlobalErrorHandlers();
    // Use the logInfo utility instead of console.log
    import('./utils/logUtils').then(({ logInfo }) => {
      logInfo('Global error handlers initialized');
    });
  }, []);

  return (
    <GlobalErrorHandler>
      <HelmetProvider>
        <Router>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <SocketProvider>
                <ScrollToTop />
                <Preload />
                <AppRoutes />
                <Toaster />
              </SocketProvider>
            </AuthProvider>
          </QueryClientProvider>
        </Router>
      </HelmetProvider>
    </GlobalErrorHandler>
  );
};

export default App;
