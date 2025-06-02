
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
import { useIsMobile } from "@/hooks/useIsMobile";

/**
 * Home dashboard component
 * Updated with LEGAL visual identity, enhanced UX and mobile responsiveness
 * Implements conditional problem cards, sync status, and improved accessibility
 */
const Home: React.FC = () => {
  // Use the consolidated dashboard assets hook
  const dashboard = useDashboardAssets();
  // Use dashboard stats for PieChart data
  const dashboardStats = useDashboardStats();

  const isMobile = useIsMobile();

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
      <div className="space-y-4 md:space-y-6 p-4 md:p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 md:h-16 md:w-16 text-legal-primary animate-spin" />
        <div className="text-center space-y-2">
          <p className="text-lg md:text-xl font-semibold legal-title">Carregando Dashboard</p>
          <p className="text-sm md:text-base text-muted-foreground legal-text">Sincronizando dados do sistema...</p>
        </div>
      </div>
    );
  }

  // Error state - only shown if critical data failed to load
  if (hasError && !dashboard.assetsStats.data) {
    return (
      <div className="space-y-4 p-4 md:p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="p-3 md:p-4 bg-red-100 dark:bg-red-950/30 rounded-full">
          <AlertTriangle className="h-12 w-12 md:h-16 md:w-16 text-red-600 dark:text-red-400" />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-xl md:text-2xl font-bold legal-title text-red-700 dark:text-red-400">
            Erro ao carregar o dashboard
          </h2>
          <p className="text-sm md:text-base text-muted-foreground text-center max-w-md legal-text px-4">
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
      <div className="space-y-4 md:space-y-6 pb-6 md:pb-10 px-4 md:px-0">
        {/* Header with Sync Status */}
        <div className="flex flex-col space-y-3 md:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-black legal-title">
              Dashboard LEGAL
            </h1>
            <div className="text-xs sm:text-sm text-muted-foreground legal-text">
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

        {/* Inventory Cards - Enhanced with LEGAL Identity and Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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

        {/* Problem Cards - Conditional Display with Mobile Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <StatusCard
            title="Chips com Problema"
            description="Ativos que necessitam de atenção imediata"
            items={dashboard.chipProblems.map(item => ({
              id: item.uuid,
              identifier: item.identifier || item.radio || item.line_number?.toString() || 'N/A',
              type: 'CHIP',
              status: item.status
            }))}
            isLoading={dashboard.problemAssets.isLoading}
            actionLink="/assets/inventory?status=problem"
            actionText="Resolver Problemas"
            variant="destructive"
            icon={<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />}
            emptyMessage="Todos os chips estão funcionando perfeitamente."
            isMobile={isMobile}
          />

          <StatusCard
            title="Speedys com Problema"
            description="Roteadores que precisam de manutenção"
            items={dashboard.speedyProblems.map(item => ({
              id: item.uuid,
              identifier: item.identifier || item.radio || item.line_number?.toString() || 'N/A',
              type: 'EQUIPAMENTO',
              status: item.status
            }))}
            isLoading={dashboard.problemAssets.isLoading}
            actionLink="/assets/inventory?status=problem"
            actionText="Resolver Problemas"
            variant="destructive"
            icon={<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />}
            emptyMessage="Todos os Speedys estão operacionais."
            isMobile={isMobile}
          />

          <StatusCard
            title="Equipamentos com Problema"
            description="Infraestrutura que requer atenção"
            items={dashboard.equipmentProblems.map(item => ({
              id: item.uuid,
              identifier: item.identifier || item.radio || item.line_number?.toString() || 'N/A',
              type: 'EQUIPAMENTO',
              status: item.status
            }))}
            isLoading={dashboard.problemAssets.isLoading}
            actionLink="/assets/inventory?status=problem"
            actionText="Resolver Problemas"
            variant="destructive"
            icon={<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />}
            emptyMessage="Toda infraestrutura está funcionando corretamente."
            isMobile={isMobile}
          />
        </div>

        {/* Lease & Subscription Cards - Mobile Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <LeaseAssetsCard 
            leaseAssetsByType={leaseAssetsByType}
            isLoading={dashboard.onLeaseAssets.isLoading}
          />
          
          <SubscriptionAssetsCard 
            subscriptionAssetsByType={subscriptionAssetsByType}
            isLoading={dashboard.onSubscriptionAssets.isLoading}
          />
        </div>

        {/* Monitoring Cards - Mobile Responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <StandardizedRecentAlertsCard dashboard={dashboard} />
          <RefactoredAssetStatusDistributionCard dashboardStats={dashboardStats} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Home;
