
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SelectedAsset } from '@modules/associations/types';

export interface AssetSearchFilters {
  searchTerm: string;
  selectedSolution: string;
  selectedStatus: string;
  type: 'all' | 'equipment' | 'chip';
  status: 'all' | 'available';
}

interface UseAssetSearchOptions {
  excludeAssociatedToClient?: string;
  selectedAssets?: SelectedAsset[];
}

export const useAssetSearch = ({ 
  excludeAssociatedToClient, 
  selectedAssets = [] 
}: UseAssetSearchOptions = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSolution, setSelectedSolution] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Criar um Set dos UUIDs selecionados para performance
  const selectedAssetIds = useMemo(() => 
    new Set(selectedAssets.map(asset => asset.uuid)), 
    [selectedAssets]
  );

  const { data: assets = [], isLoading, error } = useQuery({
    queryKey: ['assets-search', searchTerm, selectedSolution, selectedStatus, excludeAssociatedToClient],
    queryFn: async () => {
      console.log('useAssetSearch: Buscando assets', { 
        searchTerm, 
        selectedSolution, 
        selectedStatus, 
        excludeAssociatedToClient 
      });

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
          asset_status!inner(status),
          asset_solutions!inner(solution),
          manufacturers(name)
        `)
        .is('deleted_at', null);

      // Filtros de busca
      if (searchTerm.trim()) {
        query = query.or(`radio.ilike.%${searchTerm}%,line_number.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%,iccid.ilike.%${searchTerm}%`);
      }

      if (selectedSolution) {
        query = query.eq('solution_id', parseInt(selectedSolution));
      }

      if (selectedStatus) {
        query = query.eq('status_id', parseInt(selectedStatus));
      }

      // Excluir assets já associados ao cliente (se fornecido)
      if (excludeAssociatedToClient) {
        const { data: associatedAssets } = await supabase
          .from('asset_client_assoc')
          .select('asset_id')
          .eq('client_id', excludeAssociatedToClient)
          .is('exit_date', null)
          .is('deleted_at', null);

        if (associatedAssets && associatedAssets.length > 0) {
          const associatedAssetIds = associatedAssets.map(assoc => assoc.asset_id);
          query = query.not('uuid', 'in', `(${associatedAssetIds.join(',')})`);
        }
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar assets:', error);
        throw error;
      }

      return data?.map(asset => ({
        uuid: asset.uuid,
        radio: asset.radio,
        line_number: asset.line_number?.toString(),
        serial_number: asset.serial_number,
        iccid: asset.iccid,
        model: asset.model,
        status_id: asset.status_id,
        solution_id: asset.solution_id,
        manufacturer_id: asset.manufacturer_id,
        status: asset.asset_status?.status,
        solution: asset.asset_solutions?.solution,
        brand: asset.manufacturers?.name,
        type: asset.iccid ? 'CHIP' : 'EQUIPMENT'
      })) || [];
    },
    enabled: true
  });

  // Filtrar assets já selecionados apenas na exibição
  const availableAssets = useMemo(() => {
    const filtered = assets.filter(asset => !selectedAssetIds.has(asset.uuid));
    console.log('useAssetSearch: Assets disponíveis após filtro', {
      total: assets.length,
      selectedCount: selectedAssets.length,
      availableCount: filtered.length
    });
    return filtered;
  }, [assets, selectedAssetIds, selectedAssets.length]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedSolution('');
    setSelectedStatus('');
  }, []);

  const filters: AssetSearchFilters = {
    searchTerm,
    selectedSolution,
    selectedStatus,
    type: 'all',
    status: 'all'
  };

  const onFiltersUpdate = useCallback((updates: Partial<AssetSearchFilters>) => {
    if (updates.searchTerm !== undefined) setSearchTerm(updates.searchTerm);
    if (updates.selectedSolution !== undefined) setSelectedSolution(updates.selectedSolution);
    if (updates.selectedStatus !== undefined) setSelectedStatus(updates.selectedStatus);
  }, []);

  return {
    assets: availableAssets,
    searchTerm,
    setSearchTerm,
    selectedSolution,
    setSelectedSolution,
    selectedStatus,
    setSelectedStatus,
    isLoading,
    error,
    resetFilters,
    filters,
    onFiltersUpdate
  };
};
