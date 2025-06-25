
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleBadge } from '@/components/ui/role-badge';
import { useAuth } from '@/context/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

export const UserPermissionsDisplay: React.FC = () => {
  const { userRole } = useAuth();
  const permissions = usePermissions();

  const permissionsList = [
    { key: 'canViewClients', label: 'Visualizar Clientes' },
    { key: 'canCreateClients', label: 'Criar Clientes' },
    { key: 'canEditClients', label: 'Editar Clientes' },
    { key: 'canViewAssets', label: 'Visualizar Ativos' },
    { key: 'canCreateAssets', label: 'Criar Ativos' },
    { key: 'canManageAssociations', label: 'Gerenciar Associações' },
    { key: 'canViewReports', label: 'Visualizar Relatórios' },
    { key: 'canProvideSupport', label: 'Fornecer Suporte' },
    { key: 'canManageUsers', label: 'Gerenciar Usuários' },
    { key: 'canAccessAdminPanel', label: 'Acessar Painel Admin' }
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-legal-primary" />
          <CardTitle>Permissões do Usuário</CardTitle>
        </div>
        <CardDescription>
          Seu role atual: <RoleBadge role={userRole} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {permissionsList.map(({ key, label }) => {
            const hasPermission = permissions[key as keyof typeof permissions] as boolean;
            
            return (
              <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">{label}</span>
                <div className="flex items-center gap-2">
                  {hasPermission ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {hasPermission ? 'Permitido' : 'Negado'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
