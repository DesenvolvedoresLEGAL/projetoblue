
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useDashboardAssets } from "@/hooks/useDashboardAssets";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { StatsSummaryCard } from "@/components/dashboard/StatsSummaryCard";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LeaseAssetsCard } from "@/components/dashboard/LeaseAssetsCard";
import { SubscriptionAssetsCard } from "@/components/dashboard/SubscriptionAssetsCard";
import { StandardizedRecentAlertsCard } from "@/components/dashboard/StandardizedRecentAlertsCard";
import { RefactoredAssetStatusDistributionCard } from "@/components/dashboard/RefactoredAssetStatusDistributionCard";

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

  // Processing lease assets by type using the 'type' property
  const leaseAssetsByType = useMemo(() => {
    if (!dashboard.onLeaseAssets.data || dashboard.onLeaseAssets.isLoading) {
      return { chips: 0, speedys: 0, equipments: 0, total: 0 };
    }

    const chips = dashboard.onLeaseAssets.data.filter(asset => asset.type === 'CHIP').length;
    const speedys = dashboard.onLeaseAssets.data.filter(asset => 
      asset.type === 'EQUIPAMENTO' && asset.identifier.includes('SPEEDY')
    ).length;
    const equipments = dashboard.onLeaseAssets.data.filter(asset => 
      asset.type === 'EQUIPAMENTO' && !asset.identifier.includes('SPEEDY')
    ).length;

    return {
      chips,
      speedys,
      equipments,
      total: chips + speedys + equipments
    };
  }, [dashboard.onLeaseAssets.data, dashboard.onLeaseAssets.isLoading]);

  // Processing subscription assets by type using the 'type' property
  const subscriptionAssetsByType = useMemo(() => {
    if (!dashboard.onSubscriptionAssets.data || dashboard.onSubscriptionAssets.isLoading) {
      return { chips: 0, speedys: 0, equipments: 0, total: 0 };
    }

    const chips = dashboard.onSubscriptionAssets.data.filter(asset => asset.type === 'CHIP').length;
    const speedys = dashboard.onSubscriptionAssets.data.filter(asset => 
      asset.type === 'EQUIPAMENTO' && asset.identifier.includes('SPEEDY')
    ).length;
    const equipments = dashboard.onSubscriptionAssets.data.filter(asset => 
      asset.type === 'EQUIPAMENTO' && !asset.identifier.includes('SPEEDY')
    ).length;

    return {
      chips,
      speedys,
      equipments,
      total: chips + speedys + equipments
    };
  }, [dashboard.onSubscriptionAssets.data, dashboard.onSubscriptionAssets.isLoading]);

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

        {/* REFATORADO: Lease & Subscription Cards com subdivisão por tipo */}
        <div className="grid md:grid-cols-2 gap-4">
          <LeaseAssetsCard 
            leaseAssetsByType={leaseAssetsByType}
            isLoading={dashboard.onLeaseAssets.isLoading}
          />
          
          <SubscriptionAssetsCard 
            subscriptionAssetsByType={subscriptionAssetsByType}
            isLoading={dashboard.onSubscriptionAssets.isLoading}
          />
        </div>

        {/* Bottom Row - Monitoring Cards */}
        <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-2">
          {/* Recent Alerts Card - REFATORADO PARA PADRONIZAÇÃO */}
          <StandardizedRecentAlertsCard dashboard={dashboard} />

          {/* REFATORADO: Asset Status Distribution - Agora mostra apenas por status com tooltip detalhada */}
          <RefactoredAssetStatusDistributionCard dashboardStats={dashboardStats} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Home;
