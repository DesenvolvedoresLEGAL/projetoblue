
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Ticket, 
  Inbox, 
  Plus, 
  BookOpen, 
  Zap, 
  BarChart3, 
  Shield,
  Bot,
  Settings,
  Search
} from 'lucide-react';
import { PermissionButton } from '@/components/auth/PermissionButton';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { usePermissions } from '@/hooks/usePermissions';

export const TicketsNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = usePermissions();

  const ticketRoutes = [
    {
      path: '/tickets/dashboard',
      label: 'Dashboard',
      description: 'Visão geral dos tickets',
      icon: BarChart3,
      requiredRole: 'suporte' as const,
      permission: 'canAccessTickets'
    },
    {
      path: '/tickets/inbox',
      label: 'Caixa de Entrada',
      description: 'Tickets aguardando atendimento',
      icon: Inbox,
      requiredRole: 'suporte' as const,
      permission: 'canAccessTickets'
    },
    {
      path: '/tickets/my-tickets',
      label: 'Meus Tickets',
      description: 'Tickets atribuídos a você',
      icon: Ticket,
      requiredRole: null, // Disponível para todos os usuários autenticados
      permission: 'canViewDashboard'
    },
    {
      path: '/tickets/new',
      label: 'Novo Ticket',
      description: 'Criar um novo ticket',
      icon: Plus,
      requiredRole: null, // Disponível para todos os usuários autenticados
      permission: 'canViewDashboard'
    },
    {
      path: '/tickets/knowledge-base',
      label: 'Base de Conhecimento',
      description: 'Artigos e soluções',
      icon: BookOpen,
      requiredRole: null, // Disponível para todos os usuários autenticados
      permission: 'canViewDashboard'
    },
    {
      path: '/tickets/automation',
      label: 'Automação',
      description: 'Configurar regras automáticas',
      icon: Zap,
      requiredRole: 'consultor' as const,
      permission: 'canViewReports'
    },
    {
      path: '/tickets/analytics',
      label: 'Análises',
      description: 'Relatórios e métricas',
      icon: BarChart3,
      requiredRole: 'consultor' as const,
      permission: 'canViewReports'
    },
    {
      path: '/tickets/quality',
      label: 'Auditoria de Qualidade',
      description: 'Avaliação de atendimentos',
      icon: Search,
      requiredRole: 'suporte' as const,
      permission: 'canProvideSupport'
    },
    {
      path: '/tickets/copilot',
      label: 'Copiloto do Agente',
      description: 'Assistente IA para atendimento',
      icon: Bot,
      requiredRole: 'suporte' as const,
      permission: 'canProvideSupport'
    },
    {
      path: '/tickets/integrations',
      label: 'Integrações',
      description: 'Conectar sistemas externos',
      icon: Settings,
      requiredRole: 'gestor' as const,
      permission: 'canManageUsers'
    }
  ];

  // Filter routes based on permissions
  const availableRoutes = ticketRoutes.filter(route => {
    const hasPermission = permissions[route.permission as keyof typeof permissions] as boolean;
    return hasPermission;
  });

  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Sistema de Tickets
        </CardTitle>
        <CardDescription>
          Navegue pelas funcionalidades do sistema de atendimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableRoutes.map((route) => {
            const Icon = route.icon;
            const isCurrent = isCurrentPath(route.path);
            
            return route.requiredRole ? (
              <RoleGuard key={route.path} requiredRole={route.requiredRole}>
                <PermissionButton
                  requiredRole={route.requiredRole}
                  variant={isCurrent ? "default" : "outline"}
                  className="h-auto p-4 flex flex-col items-start gap-2 text-left hover:shadow-md transition-all"
                  onClick={() => navigate(route.path)}
                  tooltip={`Você precisa ser ${route.requiredRole} ou superior para esta funcionalidade`}
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <h4 className="font-semibold text-sm">{route.label}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {route.description}
                    </p>
                  </div>
                </PermissionButton>
              </RoleGuard>
            ) : (
              <Button
                key={route.path}
                variant={isCurrent ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-start gap-2 text-left hover:shadow-md transition-all"
                onClick={() => navigate(route.path)}
              >
                <Icon className="h-5 w-5" />
                <div>
                  <h4 className="font-semibold text-sm">{route.label}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {route.description}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>

        {availableRoutes.length === 0 && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Você não tem permissões para acessar o sistema de tickets.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Entre em contato com um administrador para solicitar acesso.
            </p>
          </div>
        )}

        {/* Show limited access message if user has some but not all permissions */}
        <RoleGuard requiredRole="suporte" inverse={true}>
          {availableRoutes.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-700">
                  <strong>Acesso Limitado:</strong> Algumas funcionalidades requerem permissões de suporte ou superior.
                </p>
              </div>
            </div>
          )}
        </RoleGuard>
      </CardContent>
    </Card>
  );
};
