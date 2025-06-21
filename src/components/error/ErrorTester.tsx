import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ui/error-boundary';

/**
 * Component that throws an error when a button is clicked
 * Used for testing error handling
 */
const BuggyComponent: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('This is a test error from BuggyComponent');
  }

  return (
    <div className="p-4 border rounded bg-muted/50">
      <h3 className="font-medium mb-2">Buggy Component</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This component will throw an error when you click the button below.
      </p>
      <Button 
        variant="destructive" 
        onClick={() => setShouldThrow(true)}
      >
        Throw Error
      </Button>
    </div>
  );
};

/**
 * Component that causes an async error
 */
const AsyncErrorComponent: React.FC = () => {
  const causeAsyncError = () => {
    // Simulate an async error that won't be caught by ErrorBoundary
    setTimeout(() => {
      throw new Error('Async error not caught by ErrorBoundary');
    }, 100);
  };

  return (
    <div className="p-4 border rounded bg-muted/50">
      <h3 className="font-medium mb-2">Async Error Component</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This component will cause an async error that won't be caught by the ErrorBoundary.
        It will be caught by the GlobalErrorHandler.
      </p>
      <Button 
        variant="destructive" 
        onClick={causeAsyncError}
      >
        Cause Async Error
      </Button>
    </div>
  );
};

/**
 * Component that causes a promise rejection
 */
const PromiseErrorComponent: React.FC = () => {
  const causePromiseError = () => {
    // Create a promise that rejects
    new Promise((_, reject) => {
      reject(new Error('Unhandled promise rejection'));
    });
  };

  return (
    <div className="p-4 border rounded bg-muted/50">
      <h3 className="font-medium mb-2">Promise Error Component</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This component will cause an unhandled promise rejection.
      </p>
      <Button 
        variant="destructive" 
        onClick={causePromiseError}
      >
        Cause Promise Rejection
      </Button>
    </div>
  );
};

/**
 * Error tester component that demonstrates different error scenarios
 */
const ErrorTester: React.FC = () => {
  return (
    <Card className="max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Error Handling Test</CardTitle>
        <CardDescription>
          This page demonstrates different error handling scenarios in the application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">1. Component Error with ErrorBoundary</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This error will be caught by the ErrorBoundary component and show a fallback UI.
          </p>
          <ErrorBoundary>
            <BuggyComponent />
          </ErrorBoundary>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">2. Async Error (outside ErrorBoundary)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This error will be caught by the GlobalErrorHandler and show a full-page error.
          </p>
          <AsyncErrorComponent />
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">3. Unhandled Promise Rejection</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This will cause an unhandled promise rejection that will be logged.
          </p>
          <PromiseErrorComponent />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Check the console for additional error details.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ErrorTester;
