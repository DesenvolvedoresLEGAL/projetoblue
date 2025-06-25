import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAssetsData } from '@modules/assets/hooks/useAssetsData';
import { assetService } from '@modules/assets/services/assetService';

export interface UseAssetsOptimizedOptions {
  searchTerm?: string;
  filterType?: string;
  filterStatus?: string;
  filterManufacturer?: string;
  currentPage?: number;
  pageSize?: number;
  enabled?: boolean;
}

export const useAssetsOptimized = (options: UseAssetsOptimizedOptions = {}) => {
  const queryClient = useQueryClient();
  
  // Use existing useAssetsData for main data fetching with parameters
  const assetsQuery = useAssetsData(options);
  
  // Optimized status breakdown query with caching
  const statusBreakdownQuery = useQuery({
    queryKey: ['assets', 'status-breakdown'],
    queryFn: () => assetService.statusByType(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    enabled: options.enabled !== false,
  });

  // Problem assets query with optimized caching
  const problemAssetsQuery = useQuery({
    queryKey: ['assets', 'problems'],
    queryFn: () => assetService.listProblemAssets(),
    staleTime: 1000 * 60 * 2, // 2 minutes cache for critical data
    enabled: options.enabled !== false,
  });

  // Assets by status with smart caching
  const getAssetsByStatusOptimized = useMemo(() => {
    return (statusId: number) => {
      const cacheKey = ['assets', 'by-status', statusId];
      
      // Try to get from cache first
      const cachedData = queryClient.getQueryData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Fetch and cache
      queryClient.fetchQuery({
        queryKey: cacheKey,
        queryFn: () => assetService.getAssetsByStatus(statusId),
        staleTime: 1000 * 60 * 3, // 3 minutes cache
      });
      
      return [];
    };
  }, [queryClient]);

  // Invalidation helper for bulk operations
  const invalidateAllAssetQueries = useMemo(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };
  }, [queryClient]);

  // Computed stats for dashboard optimization
  const computedStats = useMemo(() => {
    const assets = assetsQuery.data?.assets || [];
    
    return {
      total: assets.length,
      byStatus: assets.reduce((acc, asset) => {
        const statusName = asset.status?.name || 'Unknown';
        acc[statusName] = (acc[statusName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byType: assets.reduce((acc, asset) => {
        const typeName = asset.solucao?.name || 'Unknown';
        acc[typeName] = (acc[typeName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [assetsQuery.data]);

  return {
    // Main data
    assets: assetsQuery.data?.assets || [],
    totalCount: assetsQuery.data?.totalCount || 0,
    totalPages: assetsQuery.data?.totalPages || 1,
    
    // Loading states
    isLoading: assetsQuery.isLoading,
    isError: assetsQuery.isError,
    error: assetsQuery.error,
    
    // Additional optimized data
    statusBreakdown: statusBreakdownQuery.data || [],
    problemAssets: problemAssetsQuery.data || [],
    computedStats,
    
    // Optimized functions
    getAssetsByStatus: getAssetsByStatusOptimized,
    invalidateAllAssetQueries,
    
    // Refetch functions
    refetch: assetsQuery.refetch,
    refetchStatusBreakdown: statusBreakdownQuery.refetch,
    refetchProblemAssets: problemAssetsQuery.refetch,
  };
};
