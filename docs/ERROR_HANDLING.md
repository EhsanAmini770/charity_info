# Error Handling

## Overview

The Web Project Template implements a comprehensive error handling strategy to ensure a robust user experience even when unexpected errors occur. The application uses a multi-layered approach to catch and handle errors at different levels. This error handling system can be adapted for different website concepts while maintaining a consistent approach to error management.

## Error Handling Layers

The application implements error handling at multiple levels:

1. **Component Level**: Using ErrorBoundary components
2. **Application Level**: Using GlobalErrorHandler
3. **API Level**: Using ApiError components and error interceptors
4. **Global Window Level**: Catching unhandled exceptions and promise rejections

## Frontend Error Handling

### ErrorBoundary Component

The `ErrorBoundary` component is a class component that uses React's error boundary feature to catch JavaScript errors in its child component tree. It provides a fallback UI when an error occurs:

```tsx
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    logError('Component error', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback(this.state.error, this.reset)
      ) : (
        <div className="p-4 border border-red-300 rounded bg-red-50 text-red-800">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="mb-4">{this.state.error?.message || 'An error occurred'}</p>
          <button
            onClick={this.reset}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }

  private reset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };
}
```

### GlobalErrorHandler Component

The `GlobalErrorHandler` is a top-level error boundary that catches errors that aren't caught by component-level error boundaries. It's implemented at the application root level and provides a full-page error UI when an uncaught error occurs:

```tsx
class GlobalErrorHandler extends Component<GlobalErrorHandlerProps, GlobalErrorHandlerState> {
  constructor(props: GlobalErrorHandlerProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): GlobalErrorHandlerState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    logError('Uncaught application error', error);
    // Log component stack with the error
    logError('Component stack', { componentStack: errorInfo.componentStack });

    this.setState({
      errorInfo
    });
  }

  handleReload = (): void => {
    // Reload the entire page
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-charity-destructive">
                <AlertTriangle className="mr-2 h-6 w-6" />
                Application Error
              </CardTitle>
              <CardDescription>
                An unexpected error has occurred in the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {this.state.error?.message || "We're sorry, but something went wrong."}
              </p>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <div className="mt-4 p-3 bg-muted rounded-md overflow-auto max-h-[200px] text-xs">
                  <pre className="whitespace-pre-wrap font-mono">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                variant="default"
                className="w-full"
                onClick={this.handleReload}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Application
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                If this problem persists, please contact support.
              </p>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### ApiError Component

The `ApiError` component displays API-specific errors in a user-friendly way. It supports different variants and can show network status information:

```tsx
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
              <RefreshCw className="mr-2 h-3 w-3" />
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
```

### Error Logging Service

The application includes a centralized error logging service (`errorService.ts`) that:

1. Logs errors to the console in development
2. Can be configured to send errors to a monitoring service in production
3. Stores recent errors in localStorage for debugging
4. Provides utilities for extracting meaningful error messages

```tsx
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

  // Store in recent errors
  storeRecentError(errorLog);

  // In production, you could send the error to a monitoring service like Sentry
  // if (process.env.NODE_ENV === 'production' && typeof window.Sentry !== 'undefined') {
  //   window.Sentry.captureException(error, {
  //     extra: {
  //       componentStack,
  //       ...additionalInfo
  //     }
  //   });
  // }
}
```

### Global Error Handlers

The application sets up global error handlers for:

1. **Uncaught exceptions**: Using `window.addEventListener('error', ...)`
2. **Unhandled promise rejections**: Using `window.addEventListener('unhandledrejection', ...)`
3. **Network status changes**: Monitoring online/offline status

```tsx
/**
 * Initialize global error handlers
 */
export function initializeGlobalErrorHandlers(): void {
  // Handle uncaught exceptions
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), undefined, {
      type: 'uncaught-exception',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, undefined, {
      type: 'unhandled-rejection'
    });
  });

  // Monitor network status
  window.addEventListener('online', () => {
    // You could trigger a refresh of data here
    console.log('Application is online');
  });

  window.addEventListener('offline', () => {
    console.log('Application is offline');
  });
}
```

### API Error Handling

The application uses Axios interceptors to handle API errors:

```tsx
// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      // Network error or CORS issue
      logError('Network error', error);
      return Promise.reject(error);
    }

    // Handle API errors
    const { status, data } = error.response;

    // Handle authentication errors
    if (status === 401) {
      // If not on login page, redirect to login
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }

    // Log the error
    logError(`API Error (${status})`, error, {
      url: error.config.url,
      method: error.config.method,
      data: error.config.data,
      response: data
    });

    return Promise.reject(error);
  }
);
```

## Backend Error Handling

### Error Middleware

The application uses middleware to handle errors:

```javascript
// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Get status code from error or default to 500
  const statusCode = err.statusCode || 500;

  // Create error response
  const errorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Internal Server Error'
    }
  };

  // Add validation errors if available
  if (err.validationErrors) {
    errorResponse.error.validationErrors = err.validationErrors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Log error
  logger.error({
    message: 'Request error',
    error: err.message,
    stack: err.stack,
    statusCode,
    path: req.path,
    method: req.method,
    requestId: req.requestId
  });

  // Send error response
  res.status(statusCode).json(errorResponse);
};
```

### Controller Error Handling

The application uses try/catch blocks in controllers to handle errors:

```javascript
// Example controller with error handling
const newsController = {
  // Get all news
  getAllNews: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, q = '' } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search: q
      };

      const result = await newsService.getAllNews(options);

      res.json({
        success: true,
        news: result.news,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
};
```

### Error Utilities

The application includes utilities for creating and handling errors:

```javascript
// Error utilities
const errorUtils = {
  /**
   * Create a not found error
   * @param {string} message - Error message
   * @returns {Error} - Not found error
   */
  notFound: (message = 'Resource not found') => {
    return createError(404, message);
  },

  /**
   * Create a validation error
   * @param {Object} errors - Validation errors
   * @returns {Error} - Validation error
   */
  validation: (errors) => {
    const error = createError(422, 'Validation error');
    error.code = 'VALIDATION_ERROR';
    error.validationErrors = errors;
    return error;
  },

  /**
   * Create a server error
   * @param {string} message - Error message
   * @returns {Error} - Server error
   */
  server: (message = 'Internal Server Error') => {
    return createError(500, message);
  },

  /**
   * Format mongoose validation errors
   * @param {Error} err - Mongoose validation error
   * @returns {Object} - Formatted validation errors
   */
  formatMongooseErrors: (err) => {
    const errors = {};

    // Handle validation errors
    if (err.name === 'ValidationError') {
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
      return errors;
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      errors[field] = `${field} already exists`;
      return errors;
    }

    return { general: err.message };
  }
};
```

### Logging

The application uses Winston for logging:

```javascript
// Logger configuration
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'charity-info-api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});
```

## Testing Error Handling

The application includes a dedicated error testing page at `/error-test` that demonstrates different error scenarios:

```tsx
export const ErrorTestPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Error Testing | Charity Information Website</title>
        <meta name="description" content="Test error handling capabilities of the application" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Error Handling Test</h1>
        <ErrorTester />
      </div>
    </>
  );
};
```

## Best Practices

When implementing new features, follow these error handling best practices:

1. **Use ErrorBoundary for component trees**: Wrap complex component trees with ErrorBoundary
2. **Handle async errors**: Use try/catch for async operations
3. **Provide fallback UI**: Always provide a fallback UI for error states
4. **Log errors**: Use the error logging service to log errors
5. **Provide retry mechanisms**: When possible, allow users to retry failed operations

## Adapting the Error Handling System for Different Website Concepts

The error handling system can be adapted for different website concepts by customizing the error types, messages, and recovery mechanisms. Here are some examples of how the error handling system can be adapted for different website types:

### E-commerce Website

- **Custom Error Types**: PaymentError, InventoryError, ShippingError, OrderError
- **User-Friendly Messages**: "Your payment couldn't be processed. Please try a different payment method."
- **Recovery Mechanisms**: Automatic retry for payment processing, save cart items for later

### Content Management Website

- **Custom Error Types**: ContentValidationError, PublishingError, MediaUploadError
- **User-Friendly Messages**: "Your content couldn't be published. Please check the highlighted fields."
- **Recovery Mechanisms**: Auto-save drafts, restore previous versions

### Community/Forum Website

- **Custom Error Types**: PostingError, ModerationError, RateLimitError
- **User-Friendly Messages**: "Your post couldn't be submitted. Please check our community guidelines."
- **Recovery Mechanisms**: Save draft posts, suggest content modifications

### Event Registration Website

- **Custom Error Types**: RegistrationError, CapacityError, ScheduleConflictError
- **User-Friendly Messages**: "This event is currently full. Would you like to join the waitlist?"
- **Recovery Mechanisms**: Waitlist registration, suggest alternative events

## Extending the Error Handling System

To extend the error handling system for a new project:

1. Update the error logging service to send errors to a monitoring service like Sentry or LogRocket
2. Add new error types specific to your website concept
3. Implement domain-specific error messages that are helpful to users
4. Add automatic recovery mechanisms for common error scenarios
5. Implement error analytics to identify and address common issues
6. Consider adding contextual help for different error types
7. Implement progressive enhancement for critical features
