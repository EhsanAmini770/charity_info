import React from 'react';
import { Helmet } from 'react-helmet-async';
import ErrorTester from '@/components/error/ErrorTester';

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

export default ErrorTestPage;
