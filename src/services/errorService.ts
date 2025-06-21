/**
 * Error logging service
 * Provides methods for logging errors and sending them to a monitoring service
 */
import { logInfo, logWarning } from '../utils/logUtils';

// Define the structure of an error log
interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  additionalInfo?: Record<string, any>;
}

/**
 * Log an error to the console and optionally to a monitoring service
 */
export function logError(
  error: Error | unknown,
  componentStack?: string,
  additionalInfo?: Record<string, any>
): void {
  // Create the error log object
  const errorLog: ErrorLog = {
    message: getErrorMessage(error),
    stack: error instanceof Error ? error.stack : undefined,
    componentStack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    additionalInfo
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    // Use the built-in console.error for this specific case as we're already in the logError function
    // and we want to avoid circular references
    console.error('Application Error:', errorLog);
  }

  // In production, you could send this to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to a monitoring service
    // sendToMonitoringService(errorLog);

    // For now, just log to console in a more controlled way
    // Use the built-in console.error for this specific case as we're already in the logError function
    console.error(
      `[ERROR] ${errorLog.message} | ${errorLog.timestamp} | ${errorLog.url}`
    );
  }

  // You could also store in localStorage for debugging
  storeErrorInLocalStorage(errorLog);
}

/**
 * Store the error in localStorage for debugging
 * Keeps the last 10 errors
 */
function storeErrorInLocalStorage(errorLog: ErrorLog): void {
  try {
    // Get existing errors
    const storedErrors = localStorage.getItem('app_errors');
    const errors = storedErrors ? JSON.parse(storedErrors) : [];

    // Add new error
    errors.unshift({
      message: errorLog.message,
      timestamp: errorLog.timestamp,
      url: errorLog.url
    });

    // Keep only the last 10 errors
    const trimmedErrors = errors.slice(0, 10);

    // Save back to localStorage
    localStorage.setItem('app_errors', JSON.stringify(trimmedErrors));
  } catch (e) {
    // Ignore localStorage errors
    logWarning('Failed to store error in localStorage', e);
  }
}

/**
 * Get a readable message from an error object
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    // Try to extract message from axios error response
    if ('response' in error && error.response && typeof error.response === 'object') {
      const response = error.response as any;

      if (response.data && typeof response.data === 'object' && 'message' in response.data) {
        return response.data.message as string;
      }

      if ('statusText' in response) {
        return `${response.status}: ${response.statusText}`;
      }
    }

    // Try to stringify the object
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown error object';
    }
  }

  return 'Unknown error';
}

/**
 * Send the error to a monitoring service
 * This is a placeholder for integration with services like Sentry
 */
function sendToMonitoringService(errorLog: ErrorLog): void {
  // This would be implemented when integrating with a service like Sentry
  // Example:
  // Sentry.captureException(new Error(errorLog.message), {
  //   extra: errorLog
  // });
}

/**
 * Initialize error handlers for uncaught exceptions and unhandled rejections
 */
export function initializeGlobalErrorHandlers(): void {
  // Handle uncaught exceptions
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), undefined, {
      type: 'uncaught_exception',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });

    // Don't prevent default so the browser can still show its own error UI
    // return false;
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason || new Error('Unhandled Promise rejection'), undefined, {
      type: 'unhandled_rejection'
    });

    // Don't prevent default
    // return false;
  });

  // Log when the application becomes online/offline
  window.addEventListener('online', () => {
    logInfo('Application is online');
  });

  window.addEventListener('offline', () => {
    logInfo('Application is offline');
  });
}

export default {
  logError,
  getErrorMessage,
  initializeGlobalErrorHandlers
};
