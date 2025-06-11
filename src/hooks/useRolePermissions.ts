
import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import {
  hasMinimumRole,
  isSupportOrAbove,
  isClienteOrAbove,
  isAdmin,
  getAssignableRoles
} from '@/utils/roleUtils';

export const useRolePermissions = () => {
  const { profile } = useAuth();
  const userRole = profile?.role || 'user';

  const permissions = useMemo(() => ({
    // Verificações básicas de role
    isAdmin: isAdmin(userRole),
    isSupportOrAbove: isSupportOrAbove(userRole),
    isClienteOrAbove: isClienteOrAbove(userRole),
    
    // Função para verificar role mínimo
    hasMinimumRole: (requiredRole: UserRole) => hasMinimumRole(userRole, requiredRole),
    
    // Roles que podem ser atribuídos pelo usuário atual
    assignableRoles: getAssignableRoles(userRole),
    
    // Role atual do usuário
    currentRole: userRole,
    
    // Permissões específicas do sistema
    canManageUsers: isAdmin(userRole),
    canAccessAdminPanel: isAdmin(userRole),
    canProvideSupport: isSupportOrAbove(userRole),
    canManageAssets: isSupportOrAbove(userRole),
    canViewReports: isSupportOrAbove(userRole),
    canManageClients: isSupportOrAbove(userRole),
    canAccessBits: isClienteOrAbove(userRole),
    canGenerateReferrals: isClienteOrAbove(userRole)
  }), [userRole]);

  return permissions;
};
