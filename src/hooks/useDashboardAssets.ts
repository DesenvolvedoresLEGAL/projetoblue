
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import assetService from "@/services/api/asset";
import { normalizeAsset, getAssetIdentifier } from "@/utils/assetUtils";
import { useMemo } from "react";
import { StatusCardItem } from "@/components/dashboard/StatusCard";
import { formatPhoneNumber } from "@/utils/formatters";

export const useDashboardAssets = () => {
  // Consolidated query for assets by multiple statuses
  const multiStatusAssetsQuery = useQuery({
    queryKey: ["dashboard", "multiStatusAssets"],
    queryFn: async () => {
      try {
        // Get status IDs for problem assets (blocked, maintenance, no data)
        const { data: problemStatusIds } = await supabase
          .from('asset_status')
          .select('id')
          .in('status', ['BLOQUEADO', 'MANUTENÇÃO', 'SEM DADOS']);
          
        // Get lease and subscription status IDs
        const { data: leaseStatusId } = await supabase
          .from('asset_status')
          .select('id')
          .ilike('status', 'ALUGADO')
          .single();
          
        const { data: subscriptionStatusId } = await supabase
          .from('asset_status')
          .select('id')
          .ilike('status', 'ASSINATURA')
          .single();
        
        // Fetch all assets with these statuses in a single query
        const statusIds = [
          ...(problemStatusIds?.map(s => s.id) || []),
          leaseStatusId?.id,
          subscriptionStatusId?.id
        ].filter(Boolean);
        
        // Make sure statusIds is not empty to avoid SQL error
        if (statusIds.length === 0) {
          return { assets: [], problemStatusIds: [], leaseStatusId: null, subscriptionStatusId: null };
        }
        
        // Use the assetQueries directly since the assetService might not have the method yet
        const assets = await assetService.assetQueries.getAssetsByMultipleStatus(statusIds);
        
        return {
          assets,
          problemStatusIds: problemStatusIds?.map(s => s.id) || [],
          leaseStatusId: leaseStatusId?.id,
          subscriptionStatusId: subscriptionStatusId?.id
        };
      } catch (error) {
        console.error("Error fetching multi-status assets:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query for asset statistics (chips, speedys, equipment)
  const assetsStatsQuery = useQuery({
    queryKey: ["dashboard", "assetsStats"],
    queryFn: async () => {
      try {
        // Get all assets with their solution and status info
        const { data: assets, error } = await supabase
          .from('assets')
          .select(`
            uuid,
            solution_id,
            status_id,
            status:asset_status(id, status)
          `)
          .is('deleted_at', null);
          
        if (error) throw error;
        
        // Get status ID for "Disponível" to filter available assets
        const { data: availableStatus } = await supabase
          .from('asset_status')
          .select('id')
          .ilike('status', 'disponível')
          .single();
        
        const availableStatusId = availableStatus?.id || 1;
        
        return {
          assets: assets || [],
          availableStatusId
        };
      } catch (error) {
        console.error("Error fetching assets statistics:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Recent alerts query
  const recentAlertsQuery = useQuery({
    queryKey: ["dashboard", "recentAlerts"],
    queryFn: async () => {
      try {
        // Get recent logs with alert/problem events
        const { data: logs, error: eLogs } = await supabase
          .from('asset_logs')
          .select('*')
          .order('date', { ascending: false })
          .limit(5);

        const { data: assetStatus, error: eAssetStatus } = await supabase
          .from('asset_status').select('id, status');

        if (eLogs) throw eLogs;
        if (eAssetStatus) throw eAssetStatus;

        const statusMap = new Map();
        assetStatus.forEach(({ id, status }) => statusMap.set(id, status));
        
        return logs || [];
      } catch (error) {
        console.error("Error fetching recent alerts:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
  
  // Status distribution query
  const statusDistributionQuery = useQuery({
    queryKey: ["dashboard", "statusDistribution"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('status_by_asset_type');
        
        if (error) throw error;
        
        // Aggregate data by status across all types
        const statusCounts = new Map<string, number>();
        
        (data || []).forEach(item => {
          const currentCount = statusCounts.get(item.status) || 0;
          statusCounts.set(item.status, currentCount + Number(item.count));
        });
        
        // Convert to array for rendering
        return Array.from(statusCounts.entries()).map(([status, count]) => ({
          status,
          count
        }));
      } catch (error) {
        console.error("Error fetching status distribution:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Network status query (simulated)
  const networkStatusQuery = useQuery({
    queryKey: ["dashboard", "networkStatus"],
    queryFn: async () => {
      // Simulated health check
      return {
        isOperational: true,
        message: "Sistema operacional"
      };
    },
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  // Memoized data for problem assets
  const problemAssets = useMemo(() => {
    if (!multiStatusAssetsQuery.data) return [];
    
    const { assets, problemStatusIds } = multiStatusAssetsQuery.data;
    
    // Handle potential undefined values safely
    if (!assets || !problemStatusIds) return [];
    
    return assets
      .filter(asset => problemStatusIds.includes(asset.status_id))
      .map(asset => {
        const normalized = normalizeAsset(asset);
        return {
          id: normalized.uuid,
          uuid: normalized.uuid,
          identifier: normalized.identifier,
          type: normalized.type,
          status: normalized.status,
          additionalInfo: `${normalized.type}`
        };
      });
  }, [multiStatusAssetsQuery.data]);

  // Memoized data for on-lease assets
  const onLeaseAssets = useMemo(() => {
    if (!multiStatusAssetsQuery.data) return [];
    
    const { assets, leaseStatusId } = multiStatusAssetsQuery.data;
    return assets
      .filter(asset => asset.status_id === leaseStatusId)
      .map(asset => {
        const normalized = normalizeAsset(asset);
        const identifier = normalized.line_number 
          ? formatPhoneNumber(normalized.line_number)
          : normalized.identifier;
          
        return {
          id: normalized.uuid,
          uuid: normalized.uuid,
          identifier,
          type: normalized.type,
          status: normalized.status,
          additionalInfo: `${normalized.type}`
        };
      });
  }, [multiStatusAssetsQuery.data]);

  // Memoized data for subscription assets
  const onSubscriptionAssets = useMemo(() => {
    if (!multiStatusAssetsQuery.data) return [];
    
    const { assets, subscriptionStatusId } = multiStatusAssetsQuery.data;
    return assets
      .filter(asset => asset.status_id === subscriptionStatusId)
      .map(asset => {
        const normalized = normalizeAsset(asset);
        const identifier = normalized.line_number 
          ? formatPhoneNumber(normalized.line_number)
          : normalized.identifier;
          
        return {
          id: normalized.uuid,
          uuid: normalized.uuid,
          identifier,
          type: normalized.type,
          status: normalized.status,
          additionalInfo: `${normalized.type}`
        };
      });
  }, [multiStatusAssetsQuery.data]);

  // Memoized data for chips statistics
  const chipsStats = useMemo(() => {
    if (!assetsStatsQuery.data) {
      return { total: 0, available: 0, unavailable: 0 };
    }
    
    const { assets, availableStatusId } = assetsStatsQuery.data;
    const chips = assets.filter(a => a.solution_id === 11);
    const availableChips = chips.filter(a => a.status_id === availableStatusId);
    
    return {
      total: chips.length,
      available: availableChips.length,
      unavailable: chips.length - availableChips.length
    };
  }, [assetsStatsQuery.data]);

  // Memoized data for speedys statistics
  const speedysStats = useMemo(() => {
    if (!assetsStatsQuery.data) {
      return { total: 0, available: 0, unavailable: 0 };
    }
    
    const { assets, availableStatusId } = assetsStatsQuery.data;
    const speedys = assets.filter(a => a.solution_id === 1);
    const availableSpeedys = speedys.filter(a => a.status_id === availableStatusId);
    
    return {
      total: speedys.length,
      available: availableSpeedys.length,
      unavailable: speedys.length - availableSpeedys.length
    };
  }, [assetsStatsQuery.data]);

  // Memoized data for equipment statistics
  const equipmentStats = useMemo(() => {
    if (!assetsStatsQuery.data) {
      return { total: 0, available: 0, unavailable: 0 };
    }
    
    const { assets, availableStatusId } = assetsStatsQuery.data;
    const equipment = assets.filter(a => a.solution_id !== 11 && a.solution_id !== 1);
    const availableEquipment = equipment.filter(a => a.status_id === availableStatusId);
    
    return {
      total: equipment.length,
      available: availableEquipment.length,
      unavailable: equipment.length - availableEquipment.length
    };
  }, [assetsStatsQuery.data]);

  // Memoized data for formatted recent alerts
  const formattedRecentAlerts = useMemo(() => {
    if (!recentAlertsQuery.data) return [];
    
    return recentAlertsQuery.data.map(log => {
      // Extract asset type and description from details
      const details = log.details as Record<string, any> || {};
      const solutionId = details.solution_id;
      
      return {
        id: log.id,
        date: log.date ? new Date(log.date).toLocaleString().replace(',', '') : 'N/A',
        assetType: solutionId === 11 ? 'Chip' : 'Equipamento',
        description: log.event || 'Evento registrado',
        name: solutionId === 11 ? details?.line_number || [] : details?.radio || [],
        old_status: details.old_status,
        new_status: details.new_status
      };
    });
  }, [recentAlertsQuery.data]);

  return {
    problemAssets: {
      data: problemAssets,
      isLoading: multiStatusAssetsQuery.isLoading,
      error: multiStatusAssetsQuery.error
    },
    onLeaseAssets: {
      data: onLeaseAssets,
      isLoading: multiStatusAssetsQuery.isLoading,
      error: multiStatusAssetsQuery.error
    },
    onSubscriptionAssets: {
      data: onSubscriptionAssets,
      isLoading: multiStatusAssetsQuery.isLoading,
      error: multiStatusAssetsQuery.error
    },
    assetsStats: {
      data: {
        chips: chipsStats,
        speedys: speedysStats,
        equipment: equipmentStats
      },
      isLoading: assetsStatsQuery.isLoading,
      error: assetsStatsQuery.error
    },
    recentAlerts: {
      data: formattedRecentAlerts,
      isLoading: recentAlertsQuery.isLoading,
      error: recentAlertsQuery.error
    },
    statusDistribution: {
      data: statusDistributionQuery.data || [],
      isLoading: statusDistributionQuery.isLoading,
      error: statusDistributionQuery.error
    },
    networkStatus: {
      data: networkStatusQuery.data || { isOperational: false, message: "Carregando..." },
      isLoading: networkStatusQuery.isLoading,
      error: networkStatusQuery.error
    },
    isLoading: 
      multiStatusAssetsQuery.isLoading || 
      assetsStatsQuery.isLoading ||
      recentAlertsQuery.isLoading ||
      statusDistributionQuery.isLoading,
    error: 
      multiStatusAssetsQuery.error || 
      assetsStatsQuery.error ||
      recentAlertsQuery.error ||
      statusDistributionQuery.error
  };
};
