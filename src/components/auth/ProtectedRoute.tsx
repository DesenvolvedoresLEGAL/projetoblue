
import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
  showError?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole,
  fallback,
  showError = true 
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
      return (
        <div className="flex h-screen w-full items-center justify-center p-4">
          <Alert className="max-w-md bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              Você precisa estar logado para acessar esta página.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
    return null;
  }

  // Check role permissions if required
  if (requiredRole && !hasMinimumRole(requiredRole)) {
    if (fallback) return <>{fallback}</>;
    
    if (showError) {
      return (
        <div className="flex h-screen w-full items-center justify-center p-4">
          <Alert className="max-w-md bg-amber-50 border-amber-200">
            <Shield className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-600">
              Você não tem permissão para acessar esta página. 
              É necessário ter role de {requiredRole} ou superior.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
    return null;
  }

  return <>{children}</>;
};
