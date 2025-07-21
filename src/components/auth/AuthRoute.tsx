
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';

interface AuthRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export const AuthRoute = ({ children, requiredRole }: AuthRouteProps) => {
  const { isAuthenticated, isLoading, hasMinimumRole } = useAuth();
  const location = useLocation();
  const [showLoading, setShowLoading] = useState(false);
  
  // Only show loading spinner after a short delay to prevent flickering
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, 300); // Short delay before showing loading state
      
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isLoading]);

  // Don't redirect immediately, only after we've finished loading
  if (isLoading) {
    if (!showLoading) {
      // Return empty fragment to avoid layout jumps during short loads
      return <></>;
    }
    
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Verificando sua autenticação...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with the current location
  if (!isAuthenticated) {
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions if required
  if (requiredRole && !hasMinimumRole(requiredRole)) {
    
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and has required permissions, render the protected content
  return <>{children}</>;
};
