
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Plus, 
  BarChart3, 
  Search, 
  FileText, 
  Users,
  Database,
  UserCheck,
  Share2
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useDashboardAssets } from '@/hooks/useDashboardAssets';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { AssetsChart } from '@/components/dashboard/AssetsChart';

const AssetsManagement = () => {
  const navigate = useNavigate();
  const dashboardData = useDashboardAssets();

  if (dashboardData.assetsStats.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestão de Ativos</h1>
            <p className="text-muted-foreground">
              Dashboard principal para gerenciamento de ativos
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Ativos</h1>
          <p className="text-muted-foreground">
            Dashboard principal para gerenciamento de ativos
          </p>
        </div>
      </div>

      {/* KPIs */}
      <KpiCards 
        totalAssets={dashboardData.assetsStats.data.chips.total + dashboardData.assetsStats.data.speedys.total + dashboardData.assetsStats.data.equipment.total}
        activeClients={0}
        assetsWithIssues={dashboardData.problemAssets.data.length}
      />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/assets/inventory')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventário</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Visualizar e gerenciar todos os ativos
            </p>
            <Button size="sm" className="w-full mt-3" onClick={(e) => {
              e.stopPropagation();
              navigate('/assets/inventory');
            }}>
              <Search className="h-4 w-4 mr-2" />
              Acessar Inventário
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/assets/association')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nova Associação</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Associar ativos a clientes
            </p>
            <Button size="sm" className="w-full mt-3" onClick={(e) => {
              e.stopPropagation();
              navigate('/assets/association');
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Associação
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/assets/associations')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestão de Associações</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Gerenciar associações existentes
            </p>
            <Button size="sm" className="w-full mt-3" onClick={(e) => {
              e.stopPropagation();
              navigate('/assets/associations');
            }}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Gerenciar Associações
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/register-asset')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cadastrar Ativo</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Adicionar novos ativos ao sistema
            </p>
            <Button size="sm" className="w-full mt-3" onClick={(e) => {
              e.stopPropagation();
              navigate('/register-asset');
            }}>
              <Package className="h-4 w-4 mr-2" />
              Cadastrar Novo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <AssetsChart />

      {/* Additional Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestão de Clientes
            </CardTitle>
            <CardDescription>
              Gerencie os clientes e suas associações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => navigate('/clients')}
              className="w-full"
            >
              Acessar Clientes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatórios
            </CardTitle>
            <CardDescription>
              Gere relatórios e exporte dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => navigate('/export')}
              className="w-full"
            >
              Gerar Relatórios
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetsManagement;
