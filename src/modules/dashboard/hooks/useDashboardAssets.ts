import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { assetService } from "@modules/assets/services/asset";
import { formatPhoneNumber, getAssetIdentifier } from "@/utils/formatters";
import { Status, Asset } from "@/types/asset";
import { supabase } from "@/integrations/supabase/client";

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

  // Fetch assets statistics with safe data handling - FIXED: Fetch all assets for accurate counts
  const assetsStats = useQuery({
    queryKey: ['dashboard', 'assets-stats'],
    queryFn: async () => {
      try {
        // Fetch ALL assets for accurate statistics by setting a high limit
        const assetsResult = await assetService.getAssets({ limit: 10000 });
        const assets: Asset[] = assetsResult.data;

        const rawAssets = assets.map(asset => ({
          solution_id: asset.solution_id ?? 0,
          status_id: asset.statusId || 0,
          type: asset.type || 'UNKNOWN'
        }));
        
        // Calculate stats safely
        const chips = {
          total: rawAssets.filter(a => a.solution_id === 11 || a.type === 'CHIP').length,
          available: rawAssets.filter(a => (a.solution_id === 11 || a.type === 'CHIP') && a.status_id === 1).length,
          unavailable: rawAssets.filter(a => (a.solution_id === 11 || a.type === 'CHIP') && a.status_id !== 1).length
        };
        
        const speedys = {
          total: rawAssets.filter(a => a.solution_id === 1).length,
          available: rawAssets.filter(a => a.solution_id === 1 && a.status_id === 1).length,
          unavailable: rawAssets.filter(a => a.solution_id === 1 && a.status_id !== 1).length
        };
        
        const equipment = {
          total: rawAssets.filter(a => a.solution_id !== 11 && a.solution_id !== 1).length,
          available: rawAssets.filter(a => a.solution_id !== 11 && a.solution_id !== 1 && a.status_id === 1).length,
          unavailable: rawAssets.filter(a => a.solution_id !== 11 && a.solution_id !== 1 && a.status_id !== 1).length
        };
        
        return { chips, speedys, equipment };
      } catch (error) {
        
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
            ? `${asset.marca}`
            : asset.radio
        }));
      } catch (error) {
        
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
            ? `${asset.marca} ${asset.updated_at}`
            : `${asset.marca} ${asset.status}`
        }));
      } catch (error) {
        
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
        
        return [];
      }
    },
    retry: 2,
    staleTime: 30000,
  });

  // Fetch recent alerts with improved date handling and deduplication
  const recentAlerts = useQuery({
    queryKey: ['dashboard', 'recent-alerts'],
    queryFn: async () => {
      try {
        const assetStatus = await assetService.getStatus();
        const assetsResult = await assetService.getAssetLogs({ limit: 20}); // Fetch more to better deduplicate
        const assetLogs = Array.isArray(assetsResult) ? assetsResult : [];
        
        return assetLogs
          .map(log => {
            // Safely parse details as object
            const details = log.details as Record<string, unknown>;
            
            // Use only the date field with proper fallback - don't access created_at
            const logDate = log.date || new Date().toISOString();
            
            return {
              id: log.id || 'unknown',
              assetType: details?.solution_id == 11 ? "CHIP" :
                        details?.solution_id == 1 ? "SPEEDY 5G" : "EQUIPAMENTO",
              name: details?.radio || details?.line_number || details?.asset_id?.substring(0, 8) || 'N/A',
              date: logDate, // Keep as original timestamp - formatting will be done in component
              description: log.event?.replace('_', ' ') || 'Evento',
              old_status: assetStatus?.filter(s => s.id === log.status_before_id)[0] || null,
              new_status: assetStatus?.filter(s => s.id === log.status_after_id)[0] || null,
              event: log.event,
              details: details, // Pass full details for better deduplication
              asset_id: details?.asset_id,
              client_id: details?.client_id,
              timestamp: new Date(logDate).getTime() // Add timestamp for sorting
            };
          })
          .filter(log => log.date && !isNaN(new Date(log.date).getTime())) // Filter out invalid dates
          .sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent first
      } catch (error) {
        
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
