
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDashboardStats, DashboardStats } from '@/hooks/useDashboardStats';
import { AssetFilterValues } from '@/components/dashboard/AssetFilters';

interface UseDashboardWithFiltersResult {
  dashboardStats: DashboardStats | undefined;
  isLoading: boolean;
  isError: boolean;
  filteredAssets: any[];
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
        query = query.eq('solution_id', filters.assetType);
      }
      
      if (filters.status) {
        query = query.eq('status_id', filters.status);
      }
      
      if (filters.manufacturer) {
        query = query.eq('manufacturer_id', filters.manufacturer);
      }
      
      // Client filter requires a join with asset_client_assoc
      if (filters.client) {
        query = query.in('uuid', 
          supabase
            .from('asset_client_assoc')
            .select('asset_id')
            .eq('client_id', filters.client)
            .is('exit_date', null)
        );
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
        console.error('Error fetching filtered assets:', error);
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
