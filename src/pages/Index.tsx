
import React from "react";
import { 
  DashboardHeader, 
  LoadingState, 
  ErrorState,
  AlertsPanel
} from "@/components/dashboard";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { useDashboardWithFilters } from "@/hooks/useDashboardWithFilters";
import { EnhancedKpiCards } from "@/components/dashboard/EnhancedKpiCards";
import { AssetStatusByTypeCard } from "@/components/dashboard/AssetStatusByTypeCard";
import { AssetFilters } from "@/components/dashboard/AssetFilters";
import { HistoryAccessPanel } from "@/components/dashboard/HistoryAccessPanel";
import { FilteredAssetsTable } from "@/components/dashboard/FilteredAssetsTable";
import { ProblemAssetsCard } from "@/components/dashboard/ProblemAssetsCard";

const Index = () => {
  const { 
    dashboardStats, 
    isLoading, 
    isError,
    filteredAssets,
    isFilteredLoading,
    filters,
    setFilters
  } = useDashboardWithFilters();

  // Show loading state while data is being fetched
  if (isLoading) {
    return <LoadingState />;
  }

  // Handle error state
  if (isError || !dashboardStats) {
    return <ErrorState message="Falha ao carregar dados do dashboard. Tente novamente mais tarde." />;
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumbs />
      
      <DashboardHeader title="Visão Geral" />
      
      {/* Enhanced KPI Cards */}
      <EnhancedKpiCards 
        totalAssets={dashboardStats.totalAssets}
        activeClients={dashboardStats.activeClients}
        assetsWithIssues={dashboardStats.assetsWithIssues}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main content area (70%) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters */}
          <AssetFilters onFilterChange={setFilters} />

          {/* Filtered Asset Results */}
          <FilteredAssetsTable 
            assets={filteredAssets} 
            isLoading={isFilteredLoading}
            filters={filters}
          />

          {/* Asset Status by Type */}
          <AssetStatusByTypeCard />
          
          {/* History Panel */}
          <HistoryAccessPanel />
        </div>
        
        {/* Right sidebar (30%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Problem Assets Panel */}
          <ProblemAssetsCard />
          
          {/* Alerts Panel */}
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
};

export default Index;
