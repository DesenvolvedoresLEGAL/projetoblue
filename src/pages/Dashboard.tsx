
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Smartphone, Wifi, Zap, LayoutDashboard } from "lucide-react";
import { useIsMobile } from '@/hooks/useIsMobile';
import { useDashboardAssets } from '@/hooks/useDashboardAssets';
import { useDashboardAssociations } from '@/hooks/useDashboardAssociations';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { useDashboardSystemStatus } from '@/hooks/useDashboardSystemStatus';
import { useDashboardRecentActivities } from '@/hooks/useDashboardRecentActivities';
import { AssetSummaryCard } from '@/components/dashboard/AssetSummaryCard';
import { AssociationSummaryCard } from '@/components/dashboard/AssociationSummaryCard';
import { StatusDistributionChart } from '@/components/dashboard/StatusDistributionChart';
import { SystemStatusCard } from '@/components/dashboard/SystemStatusCard';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { RecentActivitiesCard } from '@/components/dashboard/RecentActivitiesCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Dashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Data hooks
  const dashboardAssets = useDashboardAssets();
  const dashboardAssociations = useDashboardAssociations();
  const dashboardCharts = useDashboardCharts();
  const systemStatus = useDashboardSystemStatus();
  const recentActivities = useDashboardRecentActivities();
  
  // Check loading states
  const isLoading = dashboardAssets.assetsStats.isLoading || 
                   dashboardAssociations.isLoading || 
                   dashboardCharts.isLoading;

  return (
    <ErrorBoundary>
      <div className="space-y-6 pb-6 px-4 md:px-0">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-black legal-title flex items-center gap-2">
              Dashboard LEGAL
            </h1>
            <div className="text-xs sm:text-sm text-muted-foreground legal-text">
              Sistema de Gestão Avançada de Ativos
            </div>
          </div>
        </div>

        {/* Asset Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <AssetSummaryCard
            title="CHIPs"
            description="Cartões SIM para conectividade móvel"
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
          <div className="lg:col-span-2">
            <AssociationSummaryCard
              totalActive={dashboardAssociations.data?.activeAssociations.total || 0}
              endingToday={dashboardAssociations.data?.endingToday || 0}
              byType={dashboardAssociations.data?.activeAssociations.byType || { aluguel: 0, assinatura: 0, outros: 0 }}
              topClients={dashboardAssociations.data?.topClients || []}
              isLoading={dashboardAssociations.isLoading}
            />
          </div>
          <div>
            <QuickActionsCard />
          </div>
        </div>

        {/* Charts and Activities */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <StatusDistributionChart
            data={dashboardCharts.data?.statusDistribution || []}
            isLoading={dashboardCharts.isLoading}
          />
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
