
import { useAuth } from '@/context/AuthContext';
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
    canDeleteClients: hasMinimumRole('consultor'),
    
    // Gestão de ativos
    canViewAssets: hasMinimumRole('suporte'),
    canCreateAssets: hasMinimumRole('suporte'),
    canEditAssets: hasMinimumRole('suporte'),
    canDeleteAssets: hasMinimumRole('consultor'),
    canManageAssociations: hasMinimumRole('suporte'),
    
    // Relatórios e análises
    canViewReports: hasMinimumRole('consultor'),
    canExportData: hasMinimumRole('consultor'),
    
    // Administração
    canManageUsers: hasMinimumRole('gestor'),
    canAccessAdminPanel: hasMinimumRole('admin'),
    canModifySystemSettings: hasMinimumRole('admin'),
    
    // Suporte técnico
    canProvideSupport: hasMinimumRole('suporte'),
    canAccessTickets: hasMinimumRole('suporte'),
    canManageTickets: hasMinimumRole('suporte')
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
