
import { useMemo } from 'react';
import { usePermissions } from './usePermissions';

export const useNavigationPermissions = () => {
  const permissions = usePermissions();

  const navigationItems = useMemo(() => ({
    // Dashboard sempre visível para usuários autenticados
    dashboard: true,
    
    // Assets - requer suporte ou superior
    assets: {
      dashboard: permissions.canViewAssets,
      inventory: permissions.canViewAssets,
      management: permissions.canViewAssets,
      register: permissions.canCreateAssets,
      associations: permissions.canManageAssociations
    },
    
    // Tickets - baseado em permissões específicas
    tickets: {
      dashboard: permissions.canProvideSupport,
      inbox: permissions.canProvideSupport,
      myTickets: true, // Todos podem ver seus próprios tickets
      new: true, // Todos podem criar tickets
      knowledgeBase: true, // Base de conhecimento é pública
      automation: permissions.canViewReports,
      analytics: permissions.canViewReports,
      quality: permissions.canProvideSupport,
      copilot: permissions.canProvideSupport
    },
    
    // BITS - disponível para cliente ou superior
    bits: {
      dashboard: permissions.canAccessBits,
      indicate: permissions.canGenerateReferrals,
      myReferrals: permissions.canGenerateReferrals,
      rewards: permissions.canAccessBits,
      settings: permissions.canAccessBits,
      help: permissions.canAccessBits
    },
    
    // Clients - requer suporte ou superior
    clients: {
      view: permissions.canViewClients,
      create: permissions.canCreateClients,
      edit: permissions.canEditClients,
      delete: permissions.canDeleteClients
    },
    
    // Admin - baseado em permissões administrativas
    admin: {
      suppliers: permissions.canManageUsers,
      settings: permissions.canAccessAdminPanel,
      users: permissions.canManageUsers,
      integrations: permissions.canManageUsers
    }
  }), [permissions]);

  return navigationItems;
};
