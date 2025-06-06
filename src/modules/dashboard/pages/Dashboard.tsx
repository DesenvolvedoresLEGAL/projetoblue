
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Smartphone, Wifi, Zap, LayoutDashboard } from "lucide-react";
import { useIsMobile } from '@/hooks/useIsMobile';
import { useDashboardAssets } from '@modules/dashboard/hooks/useDashboardAssets';
import { useDashboardAssociationsDetailed } from '@modules/dashboard/hooks/useDashboardAssociationsDetailed';
import { useDashboardStatusByType } from '@modules/dashboard/hooks/useDashboardStatusByType';
import { useDashboardRecentActivities } from '@modules/dashboard/hooks/useDashboardRecentActivities';
import { AssetSummaryCard } from '@modules/dashboard/components/dashboard/AssetSummaryCard';
import { RentalAssociationsCard } from '@modules/dashboard/components/dashboard/RentalAssociationsCard';
import { SubscriptionAssociationsCard } from '@modules/dashboard/components/dashboard/SubscriptionAssociationsCard';
import { AssetTypeStatusChart } from '@modules/dashboard/components/dashboard/AssetTypeStatusChart';
import { QuickActionsCard } from '@modules/dashboard/components/dashboard/QuickActionsCard';
import { RecentActivitiesCard } from '@modules/dashboard/components/dashboard/RecentActivitiesCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StandardPageHeader } from '@/components/ui/standard-page-header';

const Dashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Data hooks
  const dashboardAssets = useDashboardAssets();
  const associationsDetailed = useDashboardAssociationsDetailed();
  const statusByType = useDashboardStatusByType();
  const recentActivities = useDashboardRecentActivities();
  
  // Check loading states
  const isLoading = dashboardAssets.assetsStats.isLoading || 
                   associationsDetailed.isLoading || 
                   statusByType.isLoading;

  return (
    <ErrorBoundary>
      
      <StandardPageHeader
        icon={LayoutDashboard}
        title="Dashboard INVENTÁRIO"
        description="Sistema de Gestão Avançada de Ativos"
      >
      </StandardPageHeader>

        {/* Asset Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <AssetSummaryCard
            title="CHIPs"
            description="SIMCARD's para conectividade móvel"
            total={dashboardAssets.assetsStats.data.chips.total}
            available={dashboardAssets.assetsStats.data.chips.available}
            inUse={dashboardAssets.assetsStats.data.chips.unavailable}
            icon={<Smartphone className="h-5 w-5 text-[#4D2BFB]" />}
            actionLink="/assets/inventory?type=11"
            isLoading={dashboardAssets.assetsStats.isLoading}
          />

          <AssetSummaryCard
            title="Speedys 5G"
            description="Roteadores 5G de alta velocidade"
            total={dashboardAssets.assetsStats.data.speedys.total}
            available={dashboardAssets.assetsStats.data.speedys.available}
            inUse={dashboardAssets.assetsStats.data.speedys.unavailable}
            icon={<Zap className="h-5 w-5 text-[#03F9FF]" />}
            actionLink="/assets/inventory?type=1"
            isLoading={dashboardAssets.assetsStats.isLoading}
          />

          <AssetSummaryCard
            title="Equipamentos"
            description="Dispositivos e infraestrutura de rede"
            total={dashboardAssets.assetsStats.data.equipment.total}
            available={dashboardAssets.assetsStats.data.equipment.available}
            inUse={dashboardAssets.assetsStats.data.equipment.unavailable}
            icon={<Wifi className="h-5 w-5 text-[#020CBC]" />}
            actionLink="/assets/inventory"
            isLoading={dashboardAssets.assetsStats.isLoading}
          />
        </div>

        {/* Associations and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <RentalAssociationsCard
            totalActive={associationsDetailed.data?.rental.totalActive || 0}
            recentAssets={associationsDetailed.data?.rental.recentAssets || []}
            distributionByType={associationsDetailed.data?.rental.distributionByType || { chips: 0, speedys: 0, equipment: 0 }}
            isLoading={associationsDetailed.isLoading}
          />
          
          <SubscriptionAssociationsCard
            totalActive={associationsDetailed.data?.subscription.totalActive || 0}
            recentAssets={associationsDetailed.data?.subscription.recentAssets || []}
            distributionByType={associationsDetailed.data?.subscription.distributionByType || { chips: 0, speedys: 0, equipment: 0 }}
            isLoading={associationsDetailed.isLoading}
          />
          
          <QuickActionsCard />
        </div>

        {/* Asset Type Status Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <AssetTypeStatusChart
            title="Status - CHIPs"
            icon={<Smartphone className="h-5 w-5 text-[#4D2BFB]" />}
            data={statusByType.data?.chips || []}
            isLoading={statusByType.isLoading}
          />
          
          <AssetTypeStatusChart
            title="Status - Speedys 5G"
            icon={<Zap className="h-5 w-5 text-[#03F9FF]" />}
            data={statusByType.data?.speedys || []}
            isLoading={statusByType.isLoading}
          />
          
          <AssetTypeStatusChart
            title="Status - Equipamentos"
            icon={<Wifi className="h-5 w-5 text-[#020CBC]" />}
            data={statusByType.data?.equipment || []}
            isLoading={statusByType.isLoading}
          />
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <RecentActivitiesCard
            activities={recentActivities.data || []}
            isLoading={recentActivities.isLoading}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
