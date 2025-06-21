import React from "react";
import { Loader } from "lucide-react";

/**
 * Loading component for Suspense
 */
export function LoadingFallback() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
