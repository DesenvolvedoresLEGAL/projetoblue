
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/utils/toast';

interface AuthRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
}

export const AuthRoute = ({ children, requiredRole }: AuthRouteProps) => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const location = useLocation();

  // Check role permissions if specified
  const hasRequiredRole = () => {
    if (!requiredRole || !profile) return true;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(profile.role);
    }
    
    return profile.role === requiredRole;
  };

  useEffect(() => {
    // Check permissions when route changes or auth state changes
    if (isAuthenticated && !hasRequiredRole()) {
      toast.error("Você não tem permissão para acessar esta página");
    }
  }, [isAuthenticated, location.pathname, profile?.role]);

  // If still loading, show spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If authenticated but doesn't have required role, redirect to home
  if (!hasRequiredRole()) {
    return <Navigate to="/" replace />;
  }

  // If authenticated and has required role, render children
  return <>{children}</>;
};
