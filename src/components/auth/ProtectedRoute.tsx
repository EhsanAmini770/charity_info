
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "editor" | "super-admin";
}

export function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Verifying your credentials...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    toast({
      variant: "destructive",
      title: "Authentication required",
      description: "Please login to access this area",
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for required role
  if (requiredRole && user?.role !== requiredRole && user?.role !== "super-admin") {
    toast({
      variant: "destructive",
      title: "Access denied",
      description: `You need ${requiredRole} permissions to access this area`,
    });
    return <Navigate to="/admin" replace />;
  }

  // User is authenticated and has the required role
  return <>{children}</>;
}
