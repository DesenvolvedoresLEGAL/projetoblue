import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { toast } from '@/utils/toast';

export const useProtectedNavigation = () => {
  const navigate = useNavigate();
  const { hasMinimumRole, userRole } = useAuth();

  const navigateWithPermission = (
    path: string, 
    requiredRole?: UserRole,
    options?: { 
      replace?: boolean;
      showToast?: boolean;
      customMessage?: string;
    }
  ) => {
    const { replace = false, showToast = true, customMessage } = options || {};

    if (!requiredRole) {
      navigate(path, { replace });
      return true;
    }

    if (hasMinimumRole(requiredRole)) {
      navigate(path, { replace });
      return true;
    }

    if (showToast) {
      const message = customMessage || 
        `Você não tem permissão para acessar esta página. É necessário ter perfil de ${requiredRole} ou superior.`;
      
      toast.error(message);
    }

    return false;
  };

  const canNavigate = (requiredRole?: UserRole): boolean => {
    if (!requiredRole) return true;
    return hasMinimumRole(requiredRole);
  };

  const getNavigationInfo = (requiredRole?: UserRole) => {
    return {
      canNavigate: canNavigate(requiredRole),
      userRole,
      requiredRole,
      hasPermission: requiredRole ? hasMinimumRole(requiredRole) : true
    };
  };

  return {
    navigateWithPermission,
    canNavigate,
    getNavigationInfo,
    userRole,
    hasMinimumRole
  };
};
