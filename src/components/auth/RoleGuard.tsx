
import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { UserRole } from '@/types/auth';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  fallback?: ReactNode;
  inverse?: boolean; // Para mostrar conteúdo apenas se NÃO tiver a permissão
}

export const RoleGuard = ({ 
  children, 
  requiredRole,
  allowedRoles,
  fallback = null,
  inverse = false 
}: RoleGuardProps) => {
  const { hasMinimumRole, userRole } = useAuth();

  let hasPermission = false;

  if (requiredRole) {
    hasPermission = hasMinimumRole(requiredRole);
  } else if (allowedRoles) {
    hasPermission = allowedRoles.includes(userRole);
  } else {
    // Se não especificar role, assume que está autenticado
    hasPermission = true;
  }

  // Se inverse é true, inverte a lógica
  if (inverse) {
    hasPermission = !hasPermission;
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};
