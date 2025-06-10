
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Package, FileText, UserPlus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RoleGuard } from '@/components/auth/RoleGuard';

export const QuickActionsCard = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Novo Ativo',
      description: 'Registrar novo equipamento',
      icon: Plus,
      onClick: () => navigate('/assets/register'),
      color: 'bg-blue-500 hover:bg-blue-600',
      requiredRole: 'suporte' as const
    },
    {
      title: 'Nova Associação',
      description: 'Associar ativo a cliente',
      icon: Users,
      onClick: () => navigate('/associations/association'),
      color: 'bg-green-500 hover:bg-green-600',
      requiredRole: 'suporte' as const
    },
    {
      title: 'Novo Cliente',
      description: 'Cadastrar novo cliente',
      icon: UserPlus,
      onClick: () => navigate('/clients/register'),
      color: 'bg-purple-500 hover:bg-purple-600',
      requiredRole: 'suporte' as const
    },
    {
      title: 'Inventário',
      description: 'Visualizar inventário',
      icon: Package,
      onClick: () => navigate('/assets/inventory'),
      color: 'bg-orange-500 hover:bg-orange-600',
      requiredRole: 'suporte' as const
    },
    {
      title: 'Relatórios',
      description: 'Gerar relatórios',
      icon: FileText,
      onClick: () => navigate('/export'),
      color: 'bg-indigo-500 hover:bg-indigo-600',
      requiredRole: 'suporte' as const
    },
    {
      title: 'Exportar Dados',
      description: 'Exportar informações',
      icon: Download,
      onClick: () => navigate('/export'),
      color: 'bg-teal-500 hover:bg-teal-600',
      requiredRole: 'suporte' as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <RoleGuard key={index} requiredRole={action.requiredRole}>
              <Button
                variant="outline"
                className={`${action.color} text-white border-none h-20 flex flex-col items-center justify-center gap-2 p-4 transition-all duration-200 hover:scale-105`}
                onClick={action.onClick}
              >
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            </RoleGuard>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
