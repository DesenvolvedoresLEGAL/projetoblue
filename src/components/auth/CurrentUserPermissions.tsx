
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { RoleBadge } from '@/components/ui/role-badge';
import { Shield, User, CheckCircle, XCircle } from 'lucide-react';

export const CurrentUserPermissions = () => {
  const { userRole, isAuthenticated } = useAuth();
  const permissions = usePermissions();

  if (!isAuthenticated) {
    return null;
  }

  const permissionsList = [
    { key: 'canViewClients', label: 'Visualizar Clientes', category: 'Clientes' },
    { key: 'canCreateClients', label: 'Criar Clientes', category: 'Clientes' },
    { key: 'canEditClients', label: 'Editar Clientes', category: 'Clientes' },
    { key: 'canViewAssets', label: 'Visualizar Ativos', category: 'Ativos' },
    { key: 'canCreateAssets', label: 'Criar Ativos', category: 'Ativos' },
    { key: 'canManageAssociations', label: 'Gerenciar Associações', category: 'Ativos' },
    { key: 'canViewReports', label: 'Visualizar Relatórios', category: 'Relatórios' },
    { key: 'canProvideSupport', label: 'Fornecer Suporte', category: 'Suporte' },
    { key: 'canManageUsers', label: 'Gerenciar Usuários', category: 'Administração' },
    { key: 'canAccessAdminPanel', label: 'Acessar Painel Admin', category: 'Administração' }
  ];

  const groupedPermissions = permissionsList.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof permissionsList>);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              Suas Permissões
              <RoleBadge role={userRole} />
            </CardTitle>
            <CardDescription>
              Funcionalidades disponíveis com seu role atual
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {category}
              </h4>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            <div className="grid gap-2">
              {categoryPermissions.map(({ key, label }) => {
                const hasPermission = permissions[key as keyof typeof permissions] as boolean;
                
                return (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium">{label}</span>
                    <div className="flex items-center gap-2">
                      {hasPermission ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            Permitido
                          </Badge>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                            Bloqueado
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
