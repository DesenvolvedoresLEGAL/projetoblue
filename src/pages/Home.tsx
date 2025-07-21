
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, LayoutDashboard } from "lucide-react";
import { useDashboardAssets } from "@modules/dashboard/hooks/useDashboardAssets";
import { useDashboardStats } from "@modules/dashboard/hooks/useDashboardStats";
import { useDashboardRecentActivities } from "@modules/dashboard/hooks/useDashboardRecentActivities";
import { StatsSummaryCard } from "@modules/dashboard/components/dashboard/StatsSummaryCard";
import { StatusCard } from "@modules/dashboard/components/dashboard/StatusCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LeaseAssetsCard } from "@modules/dashboard/components/dashboard/LeaseAssetsCard";
import { SubscriptionAssetsCard } from "@modules/dashboard/components/dashboard/SubscriptionAssetsCard";
import { RecentActivitiesCard } from "@modules/dashboard/components/dashboard/RecentActivitiesCard";
import { RentedAssetsCard } from "@modules/dashboard/components/dashboard/RentedAssetsCard";
import { SyncStatusAlert } from "@modules/dashboard/components/dashboard/SyncStatusAlert";
import { OperadorasSection } from "@modules/dashboard/components/dashboard/OperadorasSection";
import { useIsMobile } from "@/hooks/useIsMobile";
import { StandardPageHeader } from "@/components/ui/standard-page-header";

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
  // Use recent activities hook
  const recentActivities = useDashboardRecentActivities();

  const isMobile = useIsMobile();

  // Safe loading state check
  const isLoading = dashboard.problemAssets.isLoading || 
                   dashboard.assetsStats.isLoading || 
                   dashboard.statusDistribution.isLoading ||
                   dashboardStats.isLoading ||
                   recentActivities.isLoading;

  // Safe error state check
  const hasError = dashboard.problemAssets.error || 
                   dashboard.assetsStats.error || 
                   dashboard.statusDistribution.error ||
                   dashboardStats.error ||
                   recentActivities.error;

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

  // Debug logging para verificar os dados
  
  
  
  

  // Loading state for the entire dashboard
  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6 p-4 md:p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 md:h-16 md:w-16 text-legal-primary animate-spin" />
        <div className="text-center space-y-2">
          <p className="text-lg md:text-xl font-semibold text-legal-dark dark:text-text-primary-dark">Carregando Dashboard</p>
          <p className="text-sm md:text-base text-muted-foreground">Sincronizando dados do sistema...</p>
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
          <h2 className="text-xl md:text-2xl font-bold text-red-700 dark:text-red-400">
            Erro ao carregar o dashboard
          </h2>
          <p className="text-sm md:text-base text-muted-foreground text-center max-w-md px-4">
            Não foi possível carregar os dados necessários. Verifique sua conexão e tente novamente.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-legal-primary hover:bg-legal-primary-light text-white"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>

      <StandardPageHeader
        icon={LayoutDashboard}
        title="Dashboard LEGAL"
        description="Sistema de Gestão de Ativos"
      >
      </StandardPageHeader>

      <div className="space-y-4 md:space-y-6 pb-6 md:pb-10 px-4 md:px-0">
        {/* Header with Sync Status */}
        <div className="flex flex-col space-y-3 md:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
            actionLink="/assets/inventory?solution=CHIP"
            actionText="Gerenciar Chips"
          />

          <StatsSummaryCard
            title="Total de Speedys 5G"
            description="Roteadores 5G de alta velocidade"
            data={dashboard.assetsStats.data.speedys}
            isLoading={dashboard.assetsStats.isLoading}
            actionLink="/assets/inventory?solution=SPEEDY+5G"
            actionText="Gerenciar Speedys"
          />

          <StatsSummaryCard
            title="Total de Equipamentos"
            description="Dispositivos e infraestrutura de rede"
            data={dashboard.assetsStats.data.equipment}
            isLoading={dashboard.assetsStats.isLoading}
            actionLink="/assets/inventory?exclude_solutions=CHIP,SPEEDY+5G"
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
            actionLink="/assets/inventory?status=problem&solution=11"
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
            actionLink="/assets/inventory?status=problem&solution=1"
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
            actionLink="/assets/inventory?status=problem&exclude_solutions=1,11"
            actionText="Resolver Problemas"
            variant="destructive"
            icon={<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />}
            emptyMessage="Toda infraestrutura está funcionando corretamente."
            isMobile={isMobile}
          />
        </div>

        {/* Lease & Subscription Cards - Mobile Responsive - CORRIGIDO: Removidas props antigas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <LeaseAssetsCard />
          
          <SubscriptionAssetsCard />
        </div>

        {/* Monitoring Cards - Mobile Responsive */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <RecentActivitiesCard 
            activities={recentActivities.data || []}
            isLoading={recentActivities.isLoading}
          />
          <RentedAssetsCard />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Home;
