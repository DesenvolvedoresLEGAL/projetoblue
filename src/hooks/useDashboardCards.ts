
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { assetService } from "@/services/api/assetService";

// Types for dashboard data
export interface DashboardStatsData {
  problemAssets: {
    count: number;
    items: {
      uuid: string;
      identifier: string;
      type: string;
      status: string;
    }[];
  };
  networkStatus: {
    isOperational: boolean;
    message: string;
  };
  chipsStats: {
    total: number;
    available: number;
    unavailable: number;
  };
  equipmentStats: {
    total: number;
    available: number;
    unavailable: number;
  };
  recentAlerts: {
    id: number;
    date: string;
    assetType: string;
    description: string;
  }[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
}

export const useDashboardCards = () => {
  // 1. Problem Assets (ativos com problema)
  const problemAssetsQuery = useQuery({
    queryKey: ["dashboard", "problemAssets"],
    queryFn: async () => {
      try {
        // Use the API service to fetch problem assets
        const assets = await assetService.listProblemAssets();
        
        // Get status names for mapping
        const { data: statuses } = await supabase
          .from('asset_status')
          .select('id, status');
          
        // Get solution names for mapping
        const { data: solutions } = await supabase
          .from('asset_solutions')
          .select('id, solution');
          
        // Transform data for the dashboard with consistent identifiers
        const items = assets.map(asset => {
          const solution = solutions?.find(s => s.id === asset.solution_id);
          const status = statuses?.find(s => s.id === asset.statusId);
          
          // Standardized identifier logic
          let identifier;
          if (asset.solution_id === 11) { // CHIP
            identifier = asset.line_number || asset.iccid || 'N/A';
          } else {
            // For equipment, prefer radio, then serial_number, then id
            identifier = asset.radio || asset.serial_number || asset.id || 'N/A';
          }
          
          return {
            uuid: asset.uuid,
            identifier,
            type: solution?.solution || 'Desconhecido',
            status: status?.status || 'Desconhecido'
          };
        });
        
        return {
          count: items.length,
          items: items.slice(0, 5) // Return only the first 5 for the card display
        };
      } catch (error) {
        console.error("Error fetching problem assets:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const onLeaseAssetsQuery = useQuery({
    queryKey: ["dashboard", "onLeaseAssets"],
    queryFn: async () => {
      try {
        const assets = await assetService.getAssetsByStatus(2); // Status ID 2 for "em locação"

        // Standardized identifier logic
        const items = assets.map((asset) => {
          // Determine identifier based on solution type
          let identifier;
          if (asset.solucao === "CHIP" || asset.solution_id === 11) {
            identifier = asset.line_number || asset.iccid || "N/A";
          } else {
            identifier = asset.radio || asset.serial_number || asset.id || "N/A";
          }

          return {
            id: asset.id,
            identifier,
            type: asset.solucao || asset.type || "Desconhecido",
            status: asset.status || "Desconhecido",
          };
        });
        
        return {
          count: items.length,
          items: items.slice(0, 5) // Return only the first 5 for the card display
        };
      } catch (error) {
        console.error("Error fetching assets on lease:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fix queryKey collision with onLeaseAssetsQuery by using a unique key
  const onSubscriptionAssetsQuery = useQuery({
    queryKey: ["dashboard", "onSubscriptionAssets"],
    queryFn: async () => {
      try {
        const assets = await assetService.getAssetsByStatus(3); // Status ID 3 for "em assinatura"

        // Standardized identifier logic
        const items = assets.map((asset) => {
          // Determine identifier based on solution type
          let identifier;
          if (asset.type === "CHIP" || asset.solution_id === 11) {
            identifier = asset.line_number || asset.num_linha || asset.iccid || "N/A";
          } else {
            identifier = asset.radio || asset.serial_number || asset.serialNumber || asset.id || "N/A";
          }

          return {
            id: asset.id,
            identifier,
            type: asset.solucao || asset.type || "Desconhecido",
            status: asset.status || "Desconhecido",
          };
        });
        
        return {
          count: items.length,
          items: items.slice(0, 5) // Return only the first 5 for the card display
        };
      } catch (error) {
        console.error("Error fetching subscription assets:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // 2. Network Status (status da rede)
  const networkStatusQuery = useQuery({
    queryKey: ["dashboard", "networkStatus"],
    queryFn: async () => {
      // In a real implementation, this would make a call to a health check endpoint
      // For now, we'll simulate this with a dummy response
      try {
        // Simulated health check - in a real app, replace with actual API call
        const isOperational = true;
        
        return {
          isOperational,
          message: isOperational 
            ? "Sistema operacional" 
            : "Problemas detectados na rede"
        };
      } catch (error) {
        console.error("Error checking network status:", error);
        return {
          isOperational: false,
          message: "Não foi possível verificar o status da rede"
        };
      }
    },
    staleTime: 1000 * 60 * 1, // 1 minute
  });
  
  // 3. Assets Statistics (chips and equipment counts)
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
        
        // Filter chips (solution_id === 11) and equipment (solution_id !== 11)
        const chips = (assets || []).filter(a => a.solution_id === 11);
        const equipment = (assets || []).filter(a => a.solution_id !== 11 && a.solution_id !== 1);
        const speedy = (assets || []).filter(a => a.solution_id === 1);
        
        // Count available and unavailable assets
        const availableChips = chips.filter(a => a.status_id === availableStatusId);
        const availableEquipment = equipment.filter(a => a.status_id === availableStatusId);
        const availableSpeedy = speedy.filter(a => a.status_id === availableStatusId);
        
        const onLeaseChips = chips.filter(a => a.status_id === 2);
        const onSubscriptionChips = chips.filter(a => a.status_id === 3);
        
        const onLeaseEquipment = equipment.filter(a => a.status_id === 2);
        const onSubscriptionEquipment = equipment.filter(a => a.status_id === 3);

        const onLeaseSpeedy = speedy.filter(a => a.status_id === 2);
        const onSubscriptionSpeedy = speedy.filter(a => a.status_id === 3);

        return {
          chipsStats: {
            total: chips.length,
            available: availableChips.length,
            unavailable: chips.length - availableChips.length,
            onLease: onLeaseChips.length,
            onSubscription: onSubscriptionChips.length
          },
          speedyStats: {
            total: speedy.length,
            available: availableSpeedy.length,
            unavailable: speedy.length - availableSpeedy.length,
            onLease: onLeaseSpeedy.length,
            onSubscription: onSubscriptionSpeedy.length
          },
          equipmentStats: {
            total: equipment.length,
            available: availableEquipment.length,
            unavailable: equipment.length - availableEquipment.length,
            onLease: onLeaseEquipment.length,
            onSubscription: onSubscriptionEquipment.length
          }
        };
      } catch (error) {
        console.error("Error fetching assets statistics:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // 4. Recent Alerts (alertas recentes)
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

        // Create a map for faster lookup
        const statusMap = new Map();
        assetStatus?.forEach(({ id, status }) => statusMap.set(id, status));
        
        console.log("Recent logs data:", logs);
        
        // Transform logs to alerts format with better property normalization
        return (logs || []).map(log => {
          const details = log.details as Record<string, any> || {};
          const solutionId = details.solution_id;
          
          // More consistent name extraction with fallbacks
          let name = 'N/A';
          if (solutionId === 11) {
            // For chips, use line_number
            name = details.line_number?.toString() || 'N/A';
          } else {
            // For equipment, prefer radio
            name = details.radio || 'N/A';
          }

          return {
            id: log.id,
            date: log.date ? new Date(log.date).toLocaleString().replace(',', '') : 'N/A',
            assetType: solutionId === 11 ? 'Chip' : 'Equipamento',
            description: log.event || 'Evento registrado',
            name,
            old_status: statusMap.get(details.old_status) || 'Desconhecido',
            new_status: statusMap.get(details.new_status) || 'Desconhecido'
          };
        });
      } catch (error) {
        console.error("Error fetching recent alerts:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
  
  // 5. Status Distribution (distribuição por status)
  const statusDistributionQuery = useQuery({
    queryKey: ["dashboard", "statusDistribution"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('status_by_asset_type');
        
        if (error) throw error;
        
        console.log("Status distribution data:", data);
        
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
  
  // Combine all queries for easier consumption
  return {
    problemAssets: {
      data: problemAssetsQuery.data?.items || [],
      count: problemAssetsQuery.data?.count || 0,
      isLoading: problemAssetsQuery.isLoading,
      error: problemAssetsQuery.error
    },
    onLeaseAssets: {
      data: onLeaseAssetsQuery.data?.items || [],
      count: onLeaseAssetsQuery.data?.count || 0,
      isLoading: onLeaseAssetsQuery.isLoading,
      error: onLeaseAssetsQuery.error
    },
    onSubscriptionAssets: {
      data: onSubscriptionAssetsQuery.data?.items || [],
      count: onSubscriptionAssetsQuery.data?.count || 0,
      isLoading: onSubscriptionAssetsQuery.isLoading,
      error: onSubscriptionAssetsQuery.error
    },
    networkStatus: {
      data: networkStatusQuery.data || { isOperational: false, message: "Carregando..." },
      isLoading: networkStatusQuery.isLoading,
      error: networkStatusQuery.error
    },
    assetsStats: {
      data: {
        chips: assetsStatsQuery.data?.chipsStats || { total: 0, available: 0, unavailable: 0, onLease: 0, onSubscription: 0 },
        speedys: assetsStatsQuery.data?.speedyStats || { total: 0, available: 0, unavailable: 0, onLease: 0, onSubscription: 0 },
        equipment: assetsStatsQuery.data?.equipmentStats || { total: 0, available: 0, unavailable: 0, onLease: 0, onSubscription: 0 }
      },
      isLoading: assetsStatsQuery.isLoading,
      error: assetsStatsQuery.error
    },
    recentAlerts: {
      data: recentAlertsQuery.data || [],
      isLoading: recentAlertsQuery.isLoading,
      error: recentAlertsQuery.error
    },
    statusDistribution: {
      data: statusDistributionQuery.data || [],
      isLoading: statusDistributionQuery.isLoading,
      error: statusDistributionQuery.error
    },
    isLoading: 
      problemAssetsQuery.isLoading || 
      networkStatusQuery.isLoading ||
      assetsStatsQuery.isLoading ||
      recentAlertsQuery.isLoading ||
      statusDistributionQuery.isLoading,
    error: 
      problemAssetsQuery.error || 
      networkStatusQuery.error ||
      assetsStatsQuery.error ||
      recentAlertsQuery.error ||
      statusDistributionQuery.error
  };
};
