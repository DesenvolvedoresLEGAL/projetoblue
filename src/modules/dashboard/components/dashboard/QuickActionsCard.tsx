
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  LinkIcon, 
  List, 
  UserPlus, 
  FileUser,
  History,
  Shield
} from "lucide-react";
import { PermissionButton } from '@/components/auth/PermissionButton';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { usePermissions } from '@/hooks/usePermissions';

export const QuickActionsCard = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();

  const quickActions = [
    {
      icon: PlusCircle,
      label: 'Cadastrar Ativo',
      description: 'Adicione novos equipamentos',
      path: '/assets/register',
      requiredRole: 'suporte' as const,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      permission: 'canCreateAssets'
    },
    {
      icon: LinkIcon,
      label: 'Associar Ativo',
      description: 'Vincule equipamentos aos clientes',
      path: '/assets/associations',
      requiredRole: 'suporte' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      permission: 'canManageAssociations'
    },
    {
      icon: UserPlus,
      label: 'Novo Cliente',
      description: 'Registre novos clientes',
      path: '/clients/register',
      requiredRole: 'suporte' as const,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      permission: 'canCreateClients'
    },
    {
      icon: FileUser,
      label: 'Gerenciar Clientes',
      description: 'Visualize e edite clientes',
      path: '/clients',
      requiredRole: 'suporte' as const,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      permission: 'canViewClients'
    },
    {
      icon: List,
      label: 'Ver Associações',
      description: 'Lista de equipamentos associados',
      path: '/assets/associations-list',
      requiredRole: 'suporte' as const,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      permission: 'canViewAssets'
    },
    {
      icon: History,
      label: 'Histórico',
      description: 'Movimentações dos ativos',
      path: '/assets/history',
      requiredRole: 'suporte' as const,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      permission: 'canViewAssets'
    }
  ];

  // Filter actions based on permissions
  const availableActions = quickActions.filter(action => {
    const hasPermission = permissions[action.permission as keyof typeof permissions] as boolean;
    return hasPermission;
  });

  if (availableActions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Ações Rápidas</CardTitle>
          </div>
          <CardDescription>
            Acesso às principais funcionalidades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Você não tem permissões para acessar as ações rápidas.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Entre em contato com um administrador para solicitar acesso.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>
          Acesso às principais funcionalidades do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableActions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <RoleGuard key={index} requiredRole={action.requiredRole}>
                <PermissionButton
                  requiredRole={action.requiredRole}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 text-left hover:shadow-md transition-all"
                  onClick={() => navigate(action.path)}
                  tooltip={`Você precisa ser ${action.requiredRole} ou superior para esta ação`}
                >
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{action.label}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                </PermissionButton>
              </RoleGuard>
            );
          })}
        </div>

        {/* Show limited access message if user has some but not all permissions */}
        <RoleGuard requiredRole="suporte" inverse={true}>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-700">
                <strong>Acesso Limitado:</strong> Algumas ações requerem permissões de suporte ou superior.
              </p>
            </div>
          </div>
        </RoleGuard>
      </CardContent>
    </Card>
  );
};
