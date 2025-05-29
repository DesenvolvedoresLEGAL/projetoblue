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
import { SyncStatusAlert } from "@/components/dashboard/SyncStatusAlert";

/**
 * Home dashboard component
 * Updated with LEGAL visual identity and enhanced UX
 * Implements conditional problem cards, sync status, and improved accessibility
 */
const Home: React.FC = () => {
  // Use the consolidated dashboard assets hook
  const dashboard = useDashboardAssets();
  // Use dashboard stats for PieChart data
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
        <Loader2 className="h-16 w-16 text-legal-primary animate-spin" />
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold legal-title">Carregando Dashboard</p>
          <p className="text-muted-foreground legal-text">Sincronizando dados do sistema...</p>
        </div>
      </div>
    );
  }

  // Error state - only shown if critical data failed to load
  if (hasError && !dashboard.assetsStats.data) {
    return (
      <div className="space-y-4 p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="p-4 bg-red-100 dark:bg-red-950/30 rounded-full">
          <AlertTriangle className="h-16 w-16 text-red-600 dark:text-red-400" />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold legal-title text-red-700 dark:text-red-400">
            Erro ao carregar o dashboard
          </h2>
          <p className="text-muted-foreground text-center max-w-md legal-text">
            Não foi possível carregar os dados necessários. Verifique sua conexão e tente novamente.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 legal-button"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 pb-10">
        {/* Header with Sync Status */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black legal-title">
              Dashboard LEGAL
            </h1>
            <div className="text-sm text-muted-foreground legal-text">
              Sistema de Gestão de Ativos
            </div>
          </div>
          
          {/* Sync Status Alert - High Priority UX Improvement */}
          <SyncStatusAlert 
            lastSync="Há 2 minutos"
            isOnline={true}
            isSyncing={false}
          />
        </div>

        {/* Inventory Cards - Enhanced with LEGAL Identity */}
        <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-3">
          <StatsSummaryCard
            title="Total de Chips"
            description="Cartões SIM para conectividade móvel"
            data={dashboard.assetsStats.data.chips}
            isLoading={dashboard.assetsStats.isLoading}
            actionLink="/assets/inventory?type=1"
            actionText="Gerenciar Chips"
          />

          <StatsSummaryCard
            title="Total de Speedys 5G"
            description="Roteadores 5G de alta velocidade"
            data={dashboard.assetsStats.data.speedys}
            isLoading={dashboard.assetsStats.isLoading}
            actionLink="/assets/inventory?type=1"
            actionText="Gerenciar Speedys"
          />

          <StatsSummaryCard
            title="Total de Equipamentos"
            description="Dispositivos e infraestrutura de rede"
            data={dashboard.assetsStats.data.equipment}
            isLoading={dashboard.assetsStats.isLoading}
            actionLink="/assets/inventory"
            actionText="Gerenciar Equipamentos"
          />
        </div>

        {/* Problem Cards - Conditional Display (High Priority UX) */}
        <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-3">
          <StatusCard
            title="Chips com Problema"
            description="Ativos que necessitam de atenção imediata"
            items={dashboard.chipProblems}
            isLoading={dashboard.problemAssets.isLoading}
            actionLink="/assets/inventory?status=problem"
            actionText="Resolver Problemas"
            variant="destructive"
            icon={<AlertTriangle className="h-5 w-5" />}
            emptyMessage="Todos os chips estão funcionando perfeitamente."
          />

          <StatusCard
            title="Speedys com Problema"
            description="Roteadores que precisam de manutenção"
            items={dashboard.speedyProblems}
            isLoading={dashboard.problemAssets.isLoading}
            actionLink="/assets/inventory?status=problem"
            actionText="Resolver Problemas"
            variant="destructive"
            icon={<AlertTriangle className="h-5 w-5" />}
            emptyMessage="Todos os Speedys estão operacionais."
          />

          <StatusCard
            title="Equipamentos com Problema"
            description="Infraestrutura que requer atenção"
            items={dashboard.equipmentProblems}
            isLoading={dashboard.problemAssets.isLoading}
            actionLink="/assets/inventory?status=problem"
            actionText="Resolver Problemas"
            variant="destructive"
            icon={<AlertTriangle className="h-5 w-5" />}
            emptyMessage="Toda infraestrutura está funcionando corretamente."
          />
        </div>

        {/* Lease & Subscription Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <LeaseAssetsCard 
            leaseAssetsByType={leaseAssetsByType}
            isLoading={dashboard.onLeaseAssets.isLoading}
          />
          
          <SubscriptionAssetsCard 
            subscriptionAssetsByType={subscriptionAssetsByType}
            isLoading={dashboard.onSubscriptionAssets.isLoading}
          />
        </div>

        {/* Monitoring Cards - Enhanced with Tooltips */}
        <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-2">
          <StandardizedRecentAlertsCard dashboard={dashboard} />
          <RefactoredAssetStatusDistributionCard dashboardStats={dashboardStats} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Home;
