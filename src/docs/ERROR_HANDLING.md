# Error Handling Documentation

## Overview

This document outlines the error handling strategy implemented in the Charity Information Website. The application uses a multi-layered approach to catch and handle errors at different levels, ensuring a robust user experience even when unexpected errors occur.

## Error Handling Layers

The application implements error handling at multiple levels:

1. **Component Level**: Using ErrorBoundary components
2. **Application Level**: Using GlobalErrorHandler
3. **API Level**: Using ApiError components and error interceptors
4. **Global Window Level**: Catching unhandled exceptions and promise rejections

## Components

### ErrorBoundary

The `ErrorBoundary` component is a class component that catches JavaScript errors in its child component tree. It provides a fallback UI when a component throws an error.

```tsx
<ErrorBoundary>
  <ComponentThatMightThrow />
</ErrorBoundary>
```

It can be used with a custom fallback UI:

```tsx
<ErrorBoundary
  fallback={<CustomErrorComponent />}
  onError={(error, errorInfo) => logError(error, errorInfo)}
>
  <ComponentThatMightThrow />
</ErrorBoundary>
```

There's also a HOC (Higher Order Component) version:

```tsx
const SafeComponent = withErrorBoundary(UnsafeComponent);
```

### GlobalErrorHandler

The `GlobalErrorHandler` is a top-level error boundary that catches errors that aren't caught by component-level error boundaries. It's implemented at the application root level and provides a full-page error UI when an uncaught error occurs.

### ApiError

The `ApiError` component displays API-specific errors in a user-friendly way. It supports different variants and can show network status information.

```tsx
<ApiError
  title="Failed to load data"
  error={error}
  onRetry={refetch}
/>
```

## Error Logging Service

The application includes a centralized error logging service (`errorService.ts`) that:

1. Logs errors to the console in development
2. Can be configured to send errors to a monitoring service in production
3. Stores recent errors in localStorage for debugging
4. Provides utilities for extracting meaningful error messages

## Global Error Handlers

The application sets up global error handlers for:

1. **Uncaught exceptions**: Using `window.addEventListener('error', ...)`
2. **Unhandled promise rejections**: Using `window.addEventListener('unhandledrejection', ...)`
3. **Network status changes**: Monitoring online/offline status

## Testing Error Handling

A dedicated error testing page is available at `/error-test` that demonstrates different error scenarios:

1. Component errors caught by ErrorBoundary
2. Async errors caught by GlobalErrorHandler
3. Unhandled promise rejections

## Best Practices

When implementing new features, follow these error handling best practices:

1. **Use ErrorBoundary for component trees**: Wrap complex component trees with ErrorBoundary
2. **Handle async errors**: Use try/catch for async operations
3. **Provide fallback UI**: Always provide a fallback UI for error states
4. **Log errors**: Use the error logging service to log errors
5. **Provide retry mechanisms**: When possible, allow users to retry failed operations

## Implementation Details

### Error Boundary

The ErrorBoundary uses React's error boundary lifecycle methods:
- `static getDerivedStateFromError()`
- `componentDidCatch()`

### Global Error Handler

The GlobalErrorHandler is implemented at the application root level in `App.tsx`:

```tsx
<GlobalErrorHandler>
  <HelmetProvider>
    <Router>
      {/* Application components */}
    </Router>
  </HelmetProvider>
</GlobalErrorHandler>
```

### Helmet Provider

The application uses `react-helmet-async` for managing document head tags. The `HelmetProvider` must be included at the application root level to enable the `Helmet` component to work properly in child components:

```tsx
<HelmetProvider>
  {/* Application components that use Helmet */}
</HelmetProvider>
```

Without the `HelmetProvider`, any component using `Helmet` will throw an error that cannot be caught by component-level error boundaries.

### Error Logging

Errors are logged using the `logError` function from the error service:

```tsx
logError(error, componentStack, additionalInfo);
```

## Future Improvements

Planned improvements to the error handling system:

1. Integration with a monitoring service like Sentry
2. More detailed error categorization
3. Automatic recovery mechanisms for certain error types
4. Error analytics to identify common issues
