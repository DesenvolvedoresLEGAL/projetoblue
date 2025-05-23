
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { assetService } from "@/services/api/asset";
import { formatPhoneNumber, getAssetIdentifier } from "@/utils/formatters";

/**
 * Custom hook for fetching and processing dashboard assets data
 * Problem: Consultas Redundantes, Filtro não Memoizado
 * Solução: Consolidar consultas e usar useMemo para memoização
 */
export function useDashboardAssets() {
  // Fetch problem assets
  const problemAssets = useQuery({
    queryKey: ['dashboard', 'problem-assets'],
    queryFn: () => assetService.listProblemAssets(),
  });

  // Fetch assets statistics
  const assetsStats = useQuery({
    queryKey: ['dashboard', 'assets-stats'],
    queryFn: async () => {
      // This would typically call a backend endpoint that returns aggregated stats
      const assetsResult = await assetService.getAssets();
      const assets = Array.isArray(assetsResult) ? assetsResult : assetsResult.data || [];
      
      // Calculate stats
      const chips = {
        total: assets.filter(a => a.solution_id === 11).length,
        available: assets.filter(a => a.solution_id === 11 && a.status_id === 1).length,
        unavailable: assets.filter(a => a.solution_id === 11 && a.status_id !== 1).length
      };
      
      const speedys = {
        total: assets.filter(a => a.solution_id === 1).length,
        available: assets.filter(a => a.solution_id === 1 && a.status_id === 1).length,
        unavailable: assets.filter(a => a.solution_id === 1 && a.status_id !== 1).length
      };
      
      const equipment = {
        total: assets.filter(a => a.solution_id !== 11 && a.solution_id !== 1).length,
        available: assets.filter(a => a.solution_id !== 11 && a.solution_id !== 1 && a.status_id === 1).length,
        unavailable: assets.filter(a => a.solution_id !== 11 && a.solution_id !== 1 && a.status_id !== 1).length
      };
      
      return { chips, speedys, equipment };
    }
  });

  // Fetch on-lease assets
  const onLeaseAssets = useQuery({
    queryKey: ['dashboard', 'on-lease-assets'],
    queryFn: async () => {
      const assets = await assetService.getAssetsByStatus(2); // Status ID for 'ALUGADO'
      return assets.map(asset => ({
        id: asset.uuid,
        identifier: getAssetIdentifier(asset),
        type: asset.solucao?.solution || 'Desconhecido',
        status: 'ALUGADO',
        additionalInfo: asset.line_number ? `Linha: ${formatPhoneNumber(asset.line_number)}` : undefined
      }));
    }
  });

  // Fetch on-subscription assets
  const onSubscriptionAssets = useQuery({
    queryKey: ['dashboard', 'on-subscription-assets'],
    queryFn: async () => {
      const assets = await assetService.getAssetsByStatus(3); // Status ID for 'ASSINATURA'
      return assets.map(asset => ({
        id: asset.uuid,
        identifier: getAssetIdentifier(asset),
        type: asset.solucao?.solution || 'Desconhecido',
        status: 'ASSINATURA',
        additionalInfo: asset.line_number ? `Linha: ${formatPhoneNumber(asset.line_number)}` : undefined
      }));
    }
  });

  // Fetch status distribution
  const statusDistribution = useQuery({
    queryKey: ['dashboard', 'status-distribution'],
    queryFn: async () => {
      // Ideally this should be a single API call to get aggregated data
      const result = await assetService.statusByType();
      return result || [];
    }
  });

  // Fetch recent alerts
  const recentAlerts = useQuery({
    queryKey: ['dashboard', 'recent-alerts'],
    queryFn: async () => {
      // This would typically call a backend endpoint
      const assetsResult = await assetService.getAssets({ limit: 5, sortOrder: 'desc' });
      const assets = Array.isArray(assetsResult) ? assetsResult : assetsResult.data || [];
      return assets.map(asset => ({
        id: asset.uuid,
        assetType: asset.solucao?.solution || 'Desconhecido',
        name: getAssetIdentifier(asset),
        date: new Date(asset.created_at).toLocaleDateString('pt-BR'),
        description: 'CRIADO no sistema',
        old_status: '',
        new_status: ''
      }));
    }
  });

  // Memoized problem assets by type
  const memoizedProblemAssets = useMemo(() => {
    if (problemAssets.data) {
      return problemAssets.data.map(asset => ({
        id: asset.uuid, // Add the required id field
        uuid: asset.uuid,
        identifier: getAssetIdentifier(asset),
        type: asset.solution_id === 11 ? 'CHIP' : 
              asset.solution_id === 1 ? 'SPEEDY 5G' : 'EQUIPAMENTO',
        status: 'PROBLEMA'
      }));
    }
    return [];
  }, [problemAssets.data]);

  // Memoized filtered problem assets by type
  const chipProblems = useMemo(() => 
    memoizedProblemAssets.filter(a => a.type === "CHIP"),
    [memoizedProblemAssets]
  );
  
  const speedyProblems = useMemo(() => 
    memoizedProblemAssets.filter(a => a.type === "SPEEDY 5G"),
    [memoizedProblemAssets]
  );
  
  const equipmentProblems = useMemo(() => 
    memoizedProblemAssets.filter(a => a.type !== "CHIP" && a.type !== "SPEEDY 5G"),
    [memoizedProblemAssets]
  );

  return {
    // Raw queries
    problemAssets: {
      data: memoizedProblemAssets,
      isLoading: problemAssets.isLoading,
      error: problemAssets.error
    },
    assetsStats: {
      data: assetsStats.data || { chips: { total: 0, available: 0, unavailable: 0 }, 
                                speedys: { total: 0, available: 0, unavailable: 0 }, 
                                equipment: { total: 0, available: 0, unavailable: 0 } },
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
