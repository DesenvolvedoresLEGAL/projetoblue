
import { useAuth } from '@/context/AuthProvider';
import { UserRole } from '@/types/auth';

export const usePermissions = () => {
  const { userRole, hasMinimumRole, isAuthenticated } = useAuth();

  const checkRole = (requiredRole: UserRole): boolean => {
    return hasMinimumRole(requiredRole);
  };

  const checkAnyRole = (allowedRoles: UserRole[]): boolean => {
    return allowedRoles.includes(userRole);
  };

  const checkAllRoles = (requiredRoles: UserRole[]): boolean => {
    return requiredRoles.every(role => hasMinimumRole(role));
  };

  // Permissões específicas do sistema com suporte
  const permissions = {
    // Operações básicas
    canViewDashboard: isAuthenticated,
    canAccessBits: hasMinimumRole('cliente'),
    
    // Gestão de clientes
    canViewClients: hasMinimumRole('suporte'),
    canCreateClients: hasMinimumRole('suporte'),
    canEditClients: hasMinimumRole('suporte'),
    canDeleteClients: hasMinimumRole('suporte'),
    
    // Gestão de ativos
    canViewAssets: hasMinimumRole('suporte'),
    canCreateAssets: hasMinimumRole('suporte'),
    canEditAssets: hasMinimumRole('suporte'),
    canDeleteAssets: hasMinimumRole('suporte'),
    canManageAssociations: hasMinimumRole('suporte'),
    
    // Relatórios e análises
    canViewReports: hasMinimumRole('suporte'),
    canExportData: hasMinimumRole('suporte'),
    
    // Administração
    canManageUsers: hasMinimumRole('admin'),
    canAccessAdminPanel: hasMinimumRole('admin'),
    canModifySystemSettings: hasMinimumRole('admin'),
    
    // Suporte técnico
    canProvideSupport: hasMinimumRole('suporte'),
    canAccessTickets: hasMinimumRole('suporte'),
    canManageTickets: hasMinimumRole('suporte'),
    
    // BITS - Referrals
    canGenerateReferrals: hasMinimumRole('cliente')
  };

  return {
    userRole,
    isAuthenticated,
    checkRole,
    checkAnyRole,
    checkAllRoles,
    hasMinimumRole,
    ...permissions
  };
};
