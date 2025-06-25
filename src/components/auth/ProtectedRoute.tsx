
import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { UserRole } from '@/types/auth';
import { InsufficientPermissions } from './InsufficientPermissions';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
  showError?: boolean;
  customMessage?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole,
  fallback,
  showError = true,
  customMessage
}: ProtectedRouteProps) => {
  const { isAuthenticated, hasMinimumRole, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    
    if (showError) {
      return <InsufficientPermissions message="Você precisa estar logado para acessar esta página." />;
    }
    
    return null;
  }

  // Check role permissions if required
  if (requiredRole && !hasMinimumRole(requiredRole)) {
    if (fallback) return <>{fallback}</>;
    
    if (showError) {
      return (
        <InsufficientPermissions 
          requiredRole={requiredRole}
          message={customMessage}
        />
      );
    }
    
    return null;
  }

  return <>{children}</>;
};
