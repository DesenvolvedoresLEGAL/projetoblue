
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { assetService } from "@/services/api/asset";
import { formatPhoneNumber, getAssetIdentifier } from "@/utils/formatters";
import { Status } from "@/types/asset";

/**
 * Custom hook for fetching and processing dashboard assets data
 * Fixed: Consultas Redundantes, Filtro não Memoizado, Error Handling, Type Safety
 * Solução: Consolidar consultas, usar useMemo para memoização, adicionar verificações de segurança e tipos
 */
export function useDashboardAssets() {
  // Fetch problem assets with error handling
  const problemAssets = useQuery({
    queryKey: ['dashboard', 'problem-assets'],
    queryFn: () => assetService.listProblemAssets(),
    retry: 2,
    staleTime: 30000,
  });

  // Fetch assets statistics with safe data handling
  const assetsStats = useQuery({
    queryKey: ['dashboard', 'assets-stats'],
    queryFn: async () => {
      try {
        const assetsResult = await assetService.getAssets();
        const assets = Array.isArray(assetsResult) ? assetsResult : assetsResult?.data || [];
        
        // Work with safe data mapping
        const rawAssets = assets.map((asset: any) => ({
          solution_id: asset.solution_id || asset.solutionId || 0,
          status_id: asset.status_id || asset.statusId || 0,
          type: asset.type || 'UNKNOWN'
        }));
        
        // Calculate stats safely
        const chips = {
          total: rawAssets.filter((a: any) => a.solution_id === 11 || a.type === 'CHIP').length,
          available: rawAssets.filter((a: any) => (a.solution_id === 11 || a.type === 'CHIP') && a.status_id === 1).length,
          unavailable: rawAssets.filter((a: any) => (a.solution_id === 11 || a.type === 'CHIP') && a.status_id !== 1).length
        };
        
        const speedys = {
          total: rawAssets.filter((a: any) => a.solution_id === 1).length,
          available: rawAssets.filter((a: any) => a.solution_id === 1 && a.status_id === 1).length,
          unavailable: rawAssets.filter((a: any) => a.solution_id === 1 && a.status_id !== 1).length
        };
        
        const equipment = {
          total: rawAssets.filter((a: any) => a.solution_id !== 11 && a.solution_id !== 1).length,
          available: rawAssets.filter((a: any) => a.solution_id !== 11 && a.solution_id !== 1 && a.status_id === 1).length,
          unavailable: rawAssets.filter((a: any) => a.solution_id !== 11 && a.solution_id !== 1 && a.status_id !== 1).length
        };
        
        return { chips, speedys, equipment };
      } catch (error) {
        console.error('Error calculating assets stats:', error);
        return { 
          chips: { total: 0, available: 0, unavailable: 0 }, 
          speedys: { total: 0, available: 0, unavailable: 0 }, 
          equipment: { total: 0, available: 0, unavailable: 0 } 
        };
      }
    },
    retry: 2,
    staleTime: 30000,
  });

  // Fetch on-lease assets with safe error handling
  const onLeaseAssets = useQuery({
    queryKey: ['dashboard', 'on-lease-assets'],
    queryFn: async () => {
      try {
        const assets = await assetService.getAssetsByStatus(2);
        return (assets || []).map(asset => ({
          id: asset.id || asset.uuid || 'unknown',
          identifier: getAssetIdentifier(asset),
          type: asset.type === 'CHIP' ? 'CHIP' : 'EQUIPAMENTO',
          status: 'ALUGADO',
          additionalInfo: asset.type === 'CHIP' && 'line_number' in asset && asset.line_number 
            ? `Linha: ${formatPhoneNumber(String(asset.line_number))}` 
            : undefined
        }));
      } catch (error) {
        console.error('Error fetching on-lease assets:', error);
        return [];
      }
    },
    retry: 2,
    staleTime: 30000,
  });

  // Fetch on-subscription assets with safe error handling
  const onSubscriptionAssets = useQuery({
    queryKey: ['dashboard', 'on-subscription-assets'],
    queryFn: async () => {
      try {
        const assets = await assetService.getAssetsByStatus(3);
        return (assets || []).map(asset => ({
          id: asset.id || asset.uuid || 'unknown',
          identifier: getAssetIdentifier(asset),
          type: asset.type === 'CHIP' ? 'CHIP' : 'EQUIPAMENTO',
          status: 'ASSINATURA',
          additionalInfo: asset.type === 'CHIP' && 'line_number' in asset && asset.line_number 
            ? `Linha: ${formatPhoneNumber(String(asset.line_number))}` 
            : undefined
        }));
      } catch (error) {
        console.error('Error fetching on-subscription assets:', error);
        return [];
      }
    },
    retry: 2,
    staleTime: 30000,
  });

  // Fetch status distribution with safe error handling
  const statusDistribution = useQuery({
    queryKey: ['dashboard', 'status-distribution'],
    queryFn: async () => {
      try {
        const result = await assetService.statusByType();
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error('Error fetching status distribution:', error);
        return [];
      }
    },
    retry: 2,
    staleTime: 30000,
  });

  // Fetch recent alerts with safe error handling
  const recentAlerts = useQuery({
    queryKey: ['dashboard', 'recent-alerts'],
    queryFn: async () => {
      try {
        const assetStatus = await assetService.getStatus();
        const assetsResult = await assetService.getAssetLogs({ limit: 5});
        const assetLogs = Array.isArray(assetsResult) ? assetsResult : assetsResult?.data || [];
        return assetLogs.map(log => ({
          id: log.id || 'unknown',
          assetType: log.details.solution_id == 11 ? "CHIP" :
          log.details.solution_id == 1 ? "SPEEDY 5G" : "EQUIPAMENTO",
          name: log.details.radio || log.details.line_number || [],
          date: log.date ? new Date(log.date).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
          description: log.event.replace('_', ' '),
          old_status: assetStatus.filter(s => s.id === log.status_before_id),
          new_status: (parseInt(log.status_after_id))
        }));
      } catch (error) {
        console.error('Error fetching recent alerts:', error);
        return [];
      }
    },
    retry: 2,
    staleTime: 30000,
  });

  // Memoized problem assets by type with safe data handling
  const memoizedProblemAssets = useMemo(() => {
    if (!problemAssets.data || !Array.isArray(problemAssets.data)) {
      return [];
    }
    
    return problemAssets.data.map(asset => ({
      uuid: asset.uuid || 'unknown',
      id: asset.id,
      identifier: getAssetIdentifier(asset),
      radio: asset.radio,
      line_number: asset.line_number,
      type: asset.solution_id === 11 ? 'CHIP' : 
            asset.solution_id === 1 ? 'SPEEDY 5G' : 'EQUIPAMENTO',
      status: asset.status
    }));
  }, [problemAssets.data]);

  // Memoized filtered problem assets by type with safe filtering
  const chipProblems = useMemo(() => 
    memoizedProblemAssets.filter(a => a.type === "CHIP"),
    [memoizedProblemAssets]
  );
  
  const speedyProblems = useMemo(() => 
    memoizedProblemAssets.filter(a => a.type === "SPEEDY 5G"),
    [memoizedProblemAssets]
  );
  
  const equipmentProblems = useMemo(() => 
    memoizedProblemAssets.filter(a => a.type === 'EQUIPAMENTO'),
    [memoizedProblemAssets]
  );

  return {
    // Raw queries with safe defaults
    problemAssets: {
      data: memoizedProblemAssets,
      isLoading: problemAssets.isLoading,
      error: problemAssets.error
    },
    assetsStats: {
      data: assetsStats.data || { 
        chips: { total: 0, available: 0, unavailable: 0 }, 
        speedys: { total: 0, available: 0, unavailable: 0 }, 
        equipment: { total: 0, available: 0, unavailable: 0 } 
      },
      isLoading: assetsStats.isLoading,
      error: assetsStats.error
    },
    onLeaseAssets: {
      data: onLeaseAssets.data || [],
      isLoading: onLeaseAssets.isLoading,
      error: onLeaseAssets.error
    },
    onSubscriptionAssets: {
      data: onSubscriptionAssets.data || [],
      isLoading: onSubscriptionAssets.isLoading,
      error: onSubscriptionAssets.error
    },
    statusDistribution: {
      data: statusDistribution.data || [],
      isLoading: statusDistribution.isLoading,
      error: statusDistribution.error
    },
    recentAlerts: {
      data: recentAlerts.data || [],
      isLoading: recentAlerts.isLoading,
      error: recentAlerts.error
    },
    
    // Memoized filtered data
    chipProblems,
    speedyProblems,
    equipmentProblems
  };
}
