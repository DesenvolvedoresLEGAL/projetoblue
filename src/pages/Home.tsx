
import React from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { QuickActionButtons } from "@/components/dashboard/QuickActionButtons";
import { RecentAssetsList } from "@/components/dashboard/RecentAssetsList";
import { RecentEventsList } from "@/components/dashboard/RecentEventsList";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { ErrorState } from "@/components/dashboard/ErrorState";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { toast } from "@/components/ui/use-toast";

const Home: React.FC = () => {
  const { data: dashboardStats, isLoading, error, refetch } = useDashboardStats();
  
  // Effects for debugging
  React.useEffect(() => {
    if (error) {
      console.error("Dashboard data fetch error:", error);
      toast({
        description: `Error loading dashboard: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [error]);

  React.useEffect(() => {
    console.log("Dashboard data:", dashboardStats);
  }, [dashboardStats]);
  
  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state with retry button
  if (error || !dashboardStats) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Dashboard Header */}
      <DashboardHeader title="Plataforma BLUE" />

      {/* KPI Cards */}
      <KpiCards 
        totalAssets={dashboardStats.totalAssets} 
        activeClients={dashboardStats.activeClients} 
        assetsWithIssues={dashboardStats.assetsWithIssues} 
      />

      {/* Quick Action Buttons */}
      <QuickActionButtons />

      {/* Two-Column Layout for Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assets */}
        <RecentAssetsList assets={dashboardStats.recentAssets} />

        {/* Recent Events */}
        <RecentEventsList events={dashboardStats.recentEvents} />
      </div>
    </div>
  );
};

export default Home;
