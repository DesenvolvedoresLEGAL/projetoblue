
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
  const [type, setType] = useState<'all' | 'equipment' | 'chip'>('all');
  const [status, setStatus] = useState<'all' | 'available'>('available'); // Default para "available"

  // Criar um Set dos UUIDs selecionados para performance
  const selectedAssetIds = useMemo(() => 
    new Set(selectedAssets.map(asset => asset.uuid)), 
    [selectedAssets]
  );

  const { data: assets = [], isLoading, error } = useQuery({
    queryKey: ['assets-search', searchTerm, selectedSolution, selectedStatus, type, status, excludeAssociatedToClient],
    queryFn: async () => {
      console.log('useAssetSearch: Buscando assets', { 
        searchTerm, 
        selectedSolution, 
        selectedStatus,
        type,
        status,
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
          created_at,
          asset_status!inner(status),
          asset_solutions!inner(solution),
          manufacturers(name)
        `)
        .is('deleted_at', null);

      // Filtro por status "disponível" por padrão
      if (status === 'available') {
        console.log('useAssetSearch: Aplicando filtro por status disponível');
        query = query.eq('status_id', 1); // Status "Disponível"
      }

      // Filtro por tipo de ativo baseado na solution
      if (type === 'chip') {
        console.log('useAssetSearch: Aplicando filtro por tipo CHIP');
        query = query.eq('solution_id', 11); // CHIP solution_id = 11
      } else if (type === 'equipment') {
        console.log('useAssetSearch: Aplicando filtro por tipo equipamento');
        query = query.neq('solution_id', 11); // Todos exceto CHIP
      }

      // Filtros de busca
      if (searchTerm.trim()) {
        console.log('useAssetSearch: Aplicando filtro de busca por termo:', searchTerm);
        query = query.or(`radio.ilike.%${searchTerm}%,line_number.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%,iccid.ilike.%${searchTerm}%`);
      }

      if (selectedSolution) {
        console.log('useAssetSearch: Aplicando filtro por solução:', selectedSolution);
        query = query.eq('solution_id', parseInt(selectedSolution, 10));
      }

      if (selectedStatus) {
        console.log('useAssetSearch: Aplicando filtro por status:', selectedStatus);
        query = query.eq('status_id', parseInt(selectedStatus, 10));
      }

      // Excluir assets já associados ao cliente (se fornecido)
      if (excludeAssociatedToClient) {
        console.log('useAssetSearch: Excluindo assets já associados ao cliente:', excludeAssociatedToClient);
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

      const mappedAssets = data?.map(asset => ({
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
        brand: asset.manufacturers?.name,
        type: (asset.iccid ? 'CHIP' : 'EQUIPMENT') as 'CHIP' | 'EQUIPMENT',
        registrationDate: asset.created_at || new Date().toISOString()
      })) || [];

      console.log('useAssetSearch: Assets encontrados:', mappedAssets.length);
      return mappedAssets;
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
    setType('all');
    setStatus('available'); // Manter "available" como padrão
  }, []);

  const filters: AssetSearchFilters = {
    searchTerm,
    selectedSolution,
    selectedStatus,
    type,
    status
  };

  const onFiltersUpdate = useCallback((updates: Partial<AssetSearchFilters>) => {
    console.log('useAssetSearch: Atualizando filtros:', updates);
    
    if (updates.searchTerm !== undefined) setSearchTerm(updates.searchTerm);
    if (updates.selectedSolution !== undefined) setSelectedSolution(updates.selectedSolution);
    if (updates.selectedStatus !== undefined) setSelectedStatus(updates.selectedStatus);
    if (updates.type !== undefined) setType(updates.type);
    if (updates.status !== undefined) setStatus(updates.status);
  }, []);

  return {
    assets: availableAssets,
    searchTerm,
    setSearchTerm,
    selectedSolution,
    setSelectedSolution,
    selectedStatus,
    setSelectedStatus,
    type,
    setType,
    status,
    setStatus,
    isLoading,
    error,
    resetFilters,
    filters,
    onFiltersUpdate
  };
};
