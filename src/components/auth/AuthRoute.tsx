
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthRouteProps {
  children: ReactNode;
}

export const AuthRoute = ({ children }: AuthRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // For development purposes, bypass authentication check
  // This will allow all pages to be accessed without login
  // Remove this in production
  const bypassAuth = true;

  // If still loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If bypassing auth or authenticated, render the children (protected routes)
  if (bypassAuth || isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, redirect to login page
  return <Navigate to="/login" state={{ from: location }} replace />;
};
