
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export const PrivateRoute = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated, render child routes
  if (isAuthenticated) {
    return <Outlet />;
  }

  // Redirect to login if not authenticated, preserving the intended destination
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
