
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDashboardStats, DashboardStats } from '@modules/dashboard/hooks/useDashboardStats';
import { DatabaseAsset } from '@/types/asset';
import { AssetFilterValues } from '@modules/dashboard/components/dashboard/AssetFilters';

interface UseDashboardWithFiltersResult {
  dashboardStats: DashboardStats | undefined;
  isLoading: boolean;
  isError: boolean;
  filteredAssets: DatabaseAsset[];
  isFilteredLoading: boolean;
  filters: AssetFilterValues;
  setFilters: (filters: AssetFilterValues) => void;
}

export function useDashboardWithFilters(): UseDashboardWithFiltersResult {
  const [filters, setFilters] = useState<AssetFilterValues>({});
  
  // Get base dashboard stats
  const { data: dashboardStats, isLoading, isError } = useDashboardStats();
  
  // Query for filtered assets
  const { data: filteredAssets = [], isLoading: isFilteredLoading } = useQuery({
    queryKey: ['filtered-assets', filters],
    queryFn: async () => {
      if (Object.keys(filters).length === 0) {
        return [];
      }
      
      let query = supabase
        .from('assets')
        .select(`
          uuid,
          solution_id,
          status_id,
          model,
          serial_number,
          iccid,
          radio,
          line_number,
          created_at,
          manufacturer:manufacturers(id, name),
          status:asset_status(id, status),
          solucao:asset_solutions(id, solution)
        `)
        .is('deleted_at', null);
      
      // Apply filters
      if (filters.assetType) {
        // Convert string to number for solution_id
        const solutionId = parseInt(filters.assetType, 10);
        if (!isNaN(solutionId)) {
          query = query.eq('solution_id', solutionId);
        }
      }
      
      if (filters.status) {
        // Convert string to number for status_id
        const statusId = parseInt(filters.status, 10);
        if (!isNaN(statusId)) {
          query = query.eq('status_id', statusId);
        }
      }
      
      if (filters.manufacturer) {
        // Convert string to number for manufacturer_id
        const manufacturerId = parseInt(filters.manufacturer, 10);
        if (!isNaN(manufacturerId)) {
          query = query.eq('manufacturer_id', manufacturerId);
        }
      }
      
      // Client filter requires a join with associations
      if (filters.client) {
        // Get asset IDs associated with the selected client
        const { data: associatedAssets } = await supabase
          .from('associations')
          .select('equipment_id, chip_id')
          .eq('client_id', filters.client)
          .is('exit_date', null);

        // Extract asset_ids from the result
        const assetIds = associatedAssets?.map(item => item.equipment_id || item.chip_id) || [];
        
        // Apply the filter only if we have asset IDs
        if (assetIds.length > 0) {
          query = query.in('uuid', assetIds);
        } else {
          // If no assets associated with client, return empty result
          return [];
        }
      }
      
      // Search text filter
      if (filters.searchText) {
        const searchTerm = `%${filters.searchText}%`;
        query = query.or(
          `iccid.ilike.${searchTerm},serial_number.ilike.${searchTerm},model.ilike.${searchTerm},radio.ilike.${searchTerm}`
        );
      }
      
      // Limit results to avoid large result sets
      query = query.limit(100);
      
      const { data, error } = await query;
      
      if (error) {
        
        throw error;
      }
      
      return data || [];
    },
    enabled: Object.keys(filters).length > 0,
    staleTime: 30000, // 30 seconds
  });
  
  return {
    dashboardStats,
    isLoading,
    isError,
    filteredAssets,
    isFilteredLoading,
    filters,
    setFilters,
  };
}
