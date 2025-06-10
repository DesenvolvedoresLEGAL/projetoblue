import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useDashboardData } from '../hooks/useDashboardData';
import { useDashboardAssets } from '../hooks/useDashboardAssets';
import { QuickActionsCard } from '../components/dashboard/QuickActionsCard';
import { ClientsActions } from '@/modules/clients/components/clients/ClientsActions';
import { TicketsNavigation } from '@/modules/tickets/components/tickets/TicketsNavigation';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { usePermissions } from '@/hooks/usePermissions';

const Dashboard = () => {
  const permissions = usePermissions();
  const dashboard = useDashboardData();
  const assetsDashboard = useDashboardAssets();
  const isLoading = dashboard.isLoading || assetsDashboard.problemAssets.isLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            Filtrar
          </Button>
          <Button size="sm">Relatórios</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Quick Actions - Show if user has asset permissions */}
        <RoleGuard requiredRole="suporte">
          <div className="xl:col-span-2">
            <QuickActionsCard />
          </div>
        </RoleGuard>

        {/* Clients Actions - Show if user has client permissions */}
        <RoleGuard requiredRole="suporte">
          <ClientsActions />
        </RoleGuard>
      </div>

      {/* Tickets Navigation - Available to all authenticated users */}
      <div className="grid grid-cols-1">
        <TicketsNavigation />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Receita Total</CardTitle>
            <CardDescription>Todos os seus ganhos até agora</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 12.456,00</div>
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
              <span>+20% em relação ao mês passado</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Clientes Ativos</CardTitle>
            <CardDescription>Clientes com assinaturas ativas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <Users className="h-4 w-4 mr-2 text-blue-500" />
              <span>Clientes totais: 120</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Ativos Conectados</CardTitle>
            <CardDescription>Equipamentos e chips em operação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <Package className="h-4 w-4 mr-2 text-orange-500" />
              <span>Em operação</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Alertas Críticos</CardTitle>
            <CardDescription>Problemas que precisam de atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">3</div>
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
              <span>Verificar</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Gráfico de Desempenho
            </CardTitle>
            <CardDescription>
              Análise detalhada do desempenho mensal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart className="h-6 w-6 text-gray-500 mb-4" />
            {/* Aqui você pode adicionar um componente de gráfico */}
            <div className="text-sm text-muted-foreground">
              Dados atualizados até o momento.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
