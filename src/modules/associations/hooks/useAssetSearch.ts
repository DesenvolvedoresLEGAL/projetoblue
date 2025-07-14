
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SelectedAsset, AssetSearchFilters } from '@modules/associations/types';

interface UseAssetSearchProps {
  filters?: AssetSearchFilters;
  selectedAssets?: SelectedAsset[];
  excludeAssociatedToClient?: string;
}

export const useAssetSearch = ({
  filters = {},
  selectedAssets = [],
  excludeAssociatedToClient
}: UseAssetSearchProps = {}) => {
  const [localFilters, setLocalFilters] = useState<AssetSearchFilters>({
    type: 'ALL',
    ...filters
  });

  const { data: assets = [], isLoading, error } = useQuery({
    queryKey: ['asset-search', localFilters, excludeAssociatedToClient],
    queryFn: async () => {
      if (import.meta.env.DEV) console.log('useAssetSearch: Buscando assets com filtros:', localFilters);

      let query = supabase
        .from('assets')
        .select(`
          uuid,
          radio,
          line_number,
          serial_number,
          iccid,
          model,
          status_id,
          solution_id,
          manufacturer_id,
          created_at,
          asset_status!inner(status),
          asset_solutions!inner(solution),
          manufacturers(name)
        `)
        .is('deleted_at', null);

      // Aplicar filtros apenas se especificados
      if (localFilters.statusId) {
        query = query.eq('status_id', localFilters.statusId);
      }

      if (localFilters.solutionId) {
        query = query.eq('solution_id', localFilters.solutionId);
      }

      if (localFilters.manufacturerId) {
        query = query.eq('manufacturer_id', localFilters.manufacturerId);
      }

      // Filtro por tipo de asset
      if (localFilters.type === 'CHIP') {
        query = query.eq('solution_id', 11);
      } else if (localFilters.type === 'EQUIPMENT') {
        query = query.neq('solution_id', 11);
      }

      // Busca por termo
      if (localFilters.searchTerm && localFilters.searchTerm.trim()) {
        const term = localFilters.searchTerm.trim();
        query = query.or(`radio.ilike.%${term}%,serial_number.ilike.%${term}%,iccid.ilike.%${term}%,line_number.eq.${term},model.ilike.%${term}%`);
      }

      // Excluir assets já associados ao cliente específico
      if (excludeAssociatedToClient) {
        const { data: associatedAssets } = await supabase
          .from('associations')
          .select('equipment_id, chip_id')
          .eq('client_id', excludeAssociatedToClient)
          .eq('status', true)
          .is('deleted_at', null);

        if (associatedAssets && associatedAssets.length > 0) {
          const excludeIds = [
            ...associatedAssets.map(a => a.equipment_id).filter(Boolean),
            ...associatedAssets.map(a => a.chip_id).filter(Boolean)
          ];
          
          if (excludeIds.length > 0) {
            query = query.not('uuid', 'in', `(${excludeIds.join(',')})`);
          }
        }
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100); // Aumentado de 50 para 100

      if (error) {
        if (import.meta.env.DEV) console.error('useAssetSearch: Erro na busca:', error);
        throw error;
      }

      return (data || []).map(asset => ({
        id: asset.uuid,
        uuid: asset.uuid,
        radio: asset.radio,
        line_number: asset.line_number?.toString(),
        serial_number: asset.serial_number,
        iccid: asset.iccid,
        model: asset.model,
        statusId: asset.status_id,
        solution_id: asset.solution_id,
        manufacturer_id: asset.manufacturer_id,
        status: asset.asset_status?.status,
        solucao: asset.asset_solutions?.solution,
        marca: asset.manufacturers?.name,
        type: (asset.solution_id === 11 ? 'CHIP' : 'EQUIPMENT') as 'CHIP' | 'EQUIPMENT',
        registrationDate: asset.created_at || new Date().toISOString()
      })) as SelectedAsset[];
    },
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false
  });

  // Filtrar assets já selecionados
  const filteredAssets = useMemo(() => {
    const selectedUuids = new Set(selectedAssets.map(a => a.uuid));
    return assets.filter(asset => !selectedUuids.has(asset.uuid));
  }, [assets, selectedAssets]);

  const onFiltersUpdate = (newFilters: Partial<AssetSearchFilters>) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    assets: filteredAssets,
    isLoading,
    error,
    filters: localFilters,
    onFiltersUpdate
  };
};

export type { AssetSearchFilters };
