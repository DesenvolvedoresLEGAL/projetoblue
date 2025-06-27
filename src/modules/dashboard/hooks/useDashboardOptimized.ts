
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { optimizedAssetService } from '@modules/assets/services/optimizedAssetService';
import * as dashboardQueries from '@modules/dashboard/services/dashboardQueries';
import { Asset } from '@/types/asset';
import { StandardizedEvent } from '@/utils/eventFormatters';

export interface DashboardOptimizedStats {
  totalAssets: number;
  activeClients: number;
  assetsWithIssues: number;
  statusSummary: { status: string; count: number; statusId: number }[];
  recentAssets: Asset[];
  recentEvents: StandardizedEvent[];
  pieChartData: { status: string; total: number }[];
}

export function useDashboardOptimized() {
  // Parallel queries with optimized caching
  const totalAssetsQuery = useQuery({
    queryKey: ['dashboard', 'total-assets'],
    queryFn: dashboardQueries.fetchTotalAssets,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const activeClientsQuery = useQuery({
    queryKey: ['dashboard', 'active-clients'],
    queryFn: dashboardQueries.fetchActiveClients,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const assetsWithIssuesQuery = useQuery({
    queryKey: ['dashboard', 'assets-issues'],
    queryFn: dashboardQueries.fetchAssetsWithIssues,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const statusSummaryQuery = useQuery({
    queryKey: ['dashboard', 'status-summary'],
    queryFn: () => optimizedAssetService.getStatusSummary(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const recentAssetsQuery = useQuery({
    queryKey: ['dashboard', 'recent-assets'],
    queryFn: () => optimizedAssetService.getRecentAssetsOptimized(5),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const recentEventsQuery = useQuery({
    queryKey: ['dashboard', 'recent-events'],
    queryFn: dashboardQueries.fetchEnhancedRecentEvents,
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  // Computed stats with memoization
  const computedStats = useMemo((): DashboardOptimizedStats => {
    const statusSummary = statusSummaryQuery.data || [];
    
    return {
      totalAssets: totalAssetsQuery.data?.count || 0,
      activeClients: activeClientsQuery.data?.count || 0,
      assetsWithIssues: assetsWithIssuesQuery.data?.count || 0,
      statusSummary,
      recentAssets: recentAssetsQuery.data || [],
      recentEvents: recentEventsQuery.data?.data || [],
      pieChartData: statusSummary.map(item => ({
        status: item.status,
        total: item.count
      }))
    };
  }, [
    totalAssetsQuery.data,
    activeClientsQuery.data,
    assetsWithIssuesQuery.data,
    statusSummaryQuery.data,
    recentAssetsQuery.data,
    recentEventsQuery.data
  ]);

  // Loading states
  const isLoading = 
    totalAssetsQuery.isLoading ||
    activeClientsQuery.isLoading ||
    assetsWithIssuesQuery.isLoading ||
    statusSummaryQuery.isLoading;

  const isError = 
    totalAssetsQuery.isError ||
    activeClientsQuery.isError ||
    assetsWithIssuesQuery.isError ||
    statusSummaryQuery.isError;

  return {
    stats: computedStats,
    isLoading,
    isError,
    refetchAll: () => {
      totalAssetsQuery.refetch();
      activeClientsQuery.refetch();
      assetsWithIssuesQuery.refetch();
      statusSummaryQuery.refetch();
      recentAssetsQuery.refetch();
      recentEventsQuery.refetch();
    }
  };
}
