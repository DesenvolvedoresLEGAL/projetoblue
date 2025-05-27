
import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  PieChart as PieChartIcon,
  Loader2
} from "lucide-react";
import { useDashboardAssets } from "@/hooks/useDashboardAssets";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { StatsSummaryCard } from "@/components/dashboard/StatsSummaryCard";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Home dashboard component
 * Fixed: React Error #310, Data consistency, Error handling
 * Solução: Error boundaries, safe data handling, robustez melhorada
 * 
 * REFATORADO: PieChart agora mostra apenas status de ativos com tooltip detalhada
 * conforme solicitado no prompt específico
 */
const Home: React.FC = () => {
  // Use the consolidated dashboard assets hook
  const dashboard = useDashboardAssets();
  // NEW: Use dashboard stats for PieChart data
  const dashboardStats = useDashboardStats();

  // Safe loading state check
  const isLoading = dashboard.problemAssets.isLoading || 
                   dashboard.assetsStats.isLoading || 
                   dashboard.statusDistribution.isLoading ||
                   dashboardStats.isLoading;

  // Safe error state check
  const hasError = dashboard.problemAssets.error || 
                   dashboard.assetsStats.error || 
                   dashboard.statusDistribution.error ||
                   dashboardStats.error;

  // Loading state for the entire dashboard
  if (isLoading) {
    return (
      <div className="space-y-6 p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
        <p className="text-lg text-muted-foreground">Carregando dados do dashboard...</p>
      </div>
    );
  }

  // Error state - only shown if critical data failed to load
  if (hasError && !dashboard.assetsStats.data) {
    return (
      <div className="space-y-4 p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">Erro ao carregar o dashboard</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Não foi possível carregar os dados necessários. Por favor, tente novamente mais tarde.
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 pb-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>

        {/* Inventory Cards - Inventário Rápido */}
        <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
          <StatsSummaryCard
            title="Total de Chips"
            data={dashboard.assetsStats.data.chips}
            isLoading={dashboard.assetsStats.isLoading}
            actionLink="/assets/inventory?type=1"
            actionText="Ver todos os chips"
          />

          <StatsSummaryCard
            title="Total de Speedys 5G"
            data={dashboard.assetsStats.data.speedys}
            isLoading={dashboard.assetsStats.isLoading}
            actionLink="/assets/inventory?type=1"
            actionText="Ver todos os Speedys 5G"
          />

          <StatsSummaryCard
            title="Total de Equipamentos"
            data={dashboard.assetsStats.data.equipment}
            isLoading={dashboard.assetsStats.isLoading}
            actionLink="/assets/inventory"
            actionText="Ver todos os equipamentos"
          />
        </div>

        {/* Top Priority Cards - Status Imediato */}
        <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
          <StatusCard
            title="Chips com Problema"
            description="Ativos que necessitam de atenção imediata"
            items={dashboard.chipProblems}
            isLoading={dashboard.problemAssets.isLoading}
            actionLink="/assets/inventory?status=problem"
            actionText="Ver todos os problemas"
            variant="destructive"
            icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
            emptyMessage="Nenhum chip com problema detectado."
          />

          <StatusCard
            title="Speedys com Problema"
            description="Ativos que necessitam de atenção imediata"
            items={dashboard.speedyProblems}
            isLoading={dashboard.problemAssets.isLoading}
            actionLink="/assets/inventory?status=problem"
            actionText="Ver todos os problemas"
            variant="destructive"
            icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
            emptyMessage="Nenhum Speedy com problema detectado."
          />

          <StatusCard
            title="Equipamentos com Problema"
            description="Ativos que necessitam de atenção imediata"
            items={dashboard.equipmentProblems}
            isLoading={dashboard.problemAssets.isLoading}
            actionLink="/assets/inventory?status=problem"
            actionText="Ver todos os problemas"
            variant="destructive"
            icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
            emptyMessage="Nenhum equipamento com problema detectado."
          />
        </div>

        {/* Lease & Subscription Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <StatusCard
            title="Ativos em locação"
            description="Ativos atualmente em locação"
            items={dashboard.onLeaseAssets.data}
            isLoading={dashboard.onLeaseAssets.isLoading}
            actionLink="/assets/inventory?status=on-lease"
            actionText="Ver todos em locação"
            variant="warning"
            icon={<AlertTriangle className="h-6 w-6 text-yellow-600" />}
            emptyMessage="Nenhum ativo em locação detectado."
          />
          
          <StatusCard
            title="Ativos em assinatura"
            description="Ativos atualmente em assinatura"
            items={dashboard.onSubscriptionAssets.data}
            isLoading={dashboard.onSubscriptionAssets.isLoading}
            actionLink="/assets/inventory?status=on-subscription"
            actionText="Ver todos em assinatura"
            variant="warning"
            icon={<AlertTriangle className="h-6 w-6 text-yellow-600" />}
            emptyMessage="Nenhum ativo em assinatura detectado."
          />
        </div>

        {/* Bottom Row - Monitoring Cards */}
        <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-2">
          {/* Recent Alerts Card */}
          <RecentAlertsCard dashboard={dashboard} />

          {/* REFATORADO: Asset Status Distribution - Agora mostra apenas por status com tooltip detalhada */}
          <RefactoredAssetStatusDistributionCard dashboardStats={dashboardStats} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Componente separado para Recent Alerts
const RecentAlertsCard = ({ dashboard }: { dashboard: any }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        Atividades Recentes
      </CardTitle>
      <CardDescription>
        Últimos eventos e alertas registrados no sistema
      </CardDescription>
    </CardHeader>
    <CardContent>
      {dashboard.recentAlerts.isLoading ? (
        <div className="space-y-3">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
        </div>
      ) : (dashboard.recentAlerts.data?.length ?? 0) > 0 ? (
        <ul className="space-y-3">
          {dashboard.recentAlerts.data.map((alert: any) => (
            <li key={alert.id} className="bg-muted/50 p-2 rounded-lg text-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">
                  {alert.assetType} - {alert.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {alert.date}
                </span>
              </div>
              <p className="text-muted-foreground">
                {alert.description?.includes('CRIADO') ||  alert.description?.includes('DELETE')
                  ? alert.description.charAt(0).toUpperCase() + alert.description.slice(1).toLowerCase()
                  : `${alert.description.charAt(0).toUpperCase() + alert.description.slice(1).toLowerCase()} de ${alert.old_status?.status} para ${alert.new_status?.status}`}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <Bell className="h-10 w-10 text-muted-foreground/30 mb-2" />
          <p className="text-muted-foreground">Nenhum alerta recente</p>
        </div>
      )}
    </CardContent>
    <CardFooter>
      <Link to="/history" className="w-full">
        <Button variant="outline" size="sm" className="w-full">
          Ver histórico completo
        </Button>
      </Link>
    </CardFooter>
  </Card>
);

// NOVO: Componente refatorado para Asset Status Distribution
// Exibe apenas status no PieChart, com tooltip detalhada mostrando tipos por status
const RefactoredAssetStatusDistributionCard = ({ dashboardStats }: { dashboardStats: any }) => {
  // Tooltip personalizada para mostrar detalhamento por tipo dentro de cada status
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const status = payload[0].payload.status;
      const total = payload[0].payload.total;
      
      // Busca todos os tipos que existem neste status
      const typeInfo = dashboardStats.data?.detailedStatusData
        ?.filter((item: any) => item.status === status)
        ?.map((item: any) => `${item.type}: ${item.total}`)
        ?.join(' | ') || 'Sem detalhes';
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <div className="font-semibold text-gray-900 mb-1">
            {status}: {total} ativos
          </div>
          <div className="text-sm text-gray-600">
            {typeInfo}
          </div>
        </div>
      );
    }
    return null;
  };

  // Prepare data for pie chart (memoized to prevent unnecessary recalculations)
  const statusChartData = useMemo(() => {
    if (!dashboardStats.data?.pieChartData || !Array.isArray(dashboardStats.data.pieChartData)) {
      return [];
    }
    
    return dashboardStats.data.pieChartData;
  }, [dashboardStats.data?.pieChartData]);

  // Colors for chart
  const COLORS = ['#4D2BFB', '#0ea5e9', '#f97316', '#ef4444', '#8b5cf6', '#84cc16'];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Ativos por Status
        </CardTitle>
        <CardDescription>
          Distribuição dos ativos por status (passe o mouse para ver detalhes por tipo)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-row pt-0 h-[300px] sm:h-[220px] xs:h-[180px] items-center">
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                innerRadius={window.innerWidth <= 768 ? 28 : 40}
                outerRadius={window.innerWidth <= 768 ? 38 : 70}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="total"
                nameKey="status"
                label={window.innerWidth <= 768 ? false : ({ status, total }) => `${status}: ${total}`}
                labelLine={false}
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout={window.innerWidth <= 768 ? "horizontal" : "vertical"}
                verticalAlign={window.innerWidth <= 768 ? "bottom" : "middle"}
                align={window.innerWidth <= 768 ? "center" : "right"}
                iconSize={12}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default Home;
