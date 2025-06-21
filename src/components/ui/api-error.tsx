
import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/services/errorService';

export interface ApiErrorProps {
  title?: string;
  description?: string;
  error: Error | unknown;
  onRetry?: () => void;
  resetErrorBoundary?: () => void;
  variant?: 'alert' | 'card';
}

// We're now using the centralized error service for consistent error messages

/**
 * Determine if the error is a network error
 */
function isNetworkError(error: any): boolean {
  return (
    error?.message === 'Network Error' ||
    error?.code === 'ECONNABORTED' ||
    error?.message?.includes('timeout') ||
    !navigator.onLine
  );
}

export function ApiError({
  title = "An error occurred",
  description,
  error,
  onRetry,
  resetErrorBoundary,
  variant = 'alert'
}: ApiErrorProps) {
  const errorMessage = getErrorMessage(error);
  const isOffline = isNetworkError(error);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    if (resetErrorBoundary) {
      resetErrorBoundary();
    }
  };

  // Use the description if provided, otherwise use the error message
  const displayDescription = description || errorMessage;

  // Use the alert variant (default)
  if (variant === 'alert') {
    return (
      <Alert variant="destructive" className="mt-4 animate-fadeIn">
        {isOffline ? <WifiOff className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        <AlertTitle className="font-semibold">
          {isOffline ? 'Connection Error' : title}
        </AlertTitle>
        <AlertDescription className="flex flex-col gap-2 mt-2">
          <p className="text-charity-destructive/90">{displayDescription}</p>
          {errorMessage.includes('csrf') && (
            <p className="text-sm font-medium bg-charity-destructive/10 p-2 rounded border border-charity-destructive/30">
              This appears to be a security token issue. Please try refreshing the page.
            </p>
          )}
          {(onRetry || resetErrorBoundary) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="w-fit mt-2 border-charity-destructive/30 text-charity-destructive hover:bg-charity-destructive/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Card variant is not implemented yet, fallback to alert
  return (
    <Alert variant="destructive" className="mt-4 animate-fadeIn">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="font-semibold">{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2 mt-2">
        <p className="text-charity-destructive/90">{displayDescription}</p>
        {(onRetry || resetErrorBoundary) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="w-fit mt-2 border-charity-destructive/30 text-charity-destructive hover:bg-charity-destructive/10"
          >
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
