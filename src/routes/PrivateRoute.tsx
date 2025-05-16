
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export const PrivateRoute = () => {
  const { isLoading, isAuthenticated } = useAuth();

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

  // Redirect to login if not authenticated
  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
