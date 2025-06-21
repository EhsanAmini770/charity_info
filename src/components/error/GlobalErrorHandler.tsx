import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '@/utils/logUtils';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface GlobalErrorHandlerProps {
  children: ReactNode;
}

interface GlobalErrorHandlerState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * GlobalErrorHandler component to catch and handle errors at the application root level
 * This provides a fallback UI when an uncaught error occurs anywhere in the application
 */
class GlobalErrorHandler extends Component<GlobalErrorHandlerProps, GlobalErrorHandlerState> {
  constructor(props: GlobalErrorHandlerProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorHandlerState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    logError('Uncaught application error', error);
    // Log component stack with the error
    logError('Component stack', { componentStack: errorInfo.componentStack });

    // You could also send this to a monitoring service like Sentry
    // if (typeof window.Sentry !== 'undefined') {
    //   window.Sentry.captureException(error);
    // }

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
      // Render fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md border-destructive/50 shadow-lg">
            <CardHeader className="bg-destructive/10 border-b border-destructive/20">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Application Error
              </CardTitle>
              <CardDescription className="text-destructive/90">
                {this.state.error?.message || 'An unexpected error occurred'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                The application encountered an error and cannot continue. This could be due to a temporary issue.
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

export default GlobalErrorHandler;
