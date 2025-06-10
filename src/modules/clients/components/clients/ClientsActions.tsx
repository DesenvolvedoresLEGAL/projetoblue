
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, FileUser, Shield } from 'lucide-react';
import { PermissionButton } from '@/components/auth/PermissionButton';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { usePermissions } from '@/hooks/usePermissions';

export const ClientsActions = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUser className="h-5 w-5" />
          Ações de Clientes
        </CardTitle>
        <CardDescription>
          Gerencie clientes e suas informações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <RoleGuard requiredRole="suporte">
            <PermissionButton
              requiredRole="suporte"
              onClick={() => navigate('/clients/register')}
              className="w-full justify-start"
              tooltip="Você precisa ser suporte ou superior para cadastrar clientes"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar Novo Cliente
            </PermissionButton>
          </RoleGuard>

          <RoleGuard requiredRole="suporte">
            <PermissionButton
              requiredRole="suporte"
              variant="outline"
              onClick={() => navigate('/clients')}
              className="w-full justify-start"
              tooltip="Você precisa ser suporte ou superior para gerenciar clientes"
            >
              <FileUser className="h-4 w-4 mr-2" />
              Gerenciar Clientes Existentes
            </PermissionButton>
          </RoleGuard>
        </div>

        {/* Show message for users without permissions */}
        <RoleGuard requiredRole="suporte" inverse={true}>
          <div className="text-center py-6">
            <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Você não tem permissões para gerenciar clientes.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Entre em contato com um administrador para solicitar acesso.
            </p>
          </div>
        </RoleGuard>
      </CardContent>
    </Card>
  );
};
