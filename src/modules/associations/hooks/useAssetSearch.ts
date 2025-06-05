
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SelectedAsset } from '@modules/associations/types';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

interface UseAssetSearchParams {
  selectedAssets: SelectedAsset[];
  enabled?: boolean;
}

export interface AssetSearchFilters {
  type: 'all' | 'chip' | 'equipment';
  searchTerm: string;
  status: 'available' | 'all';
}

export const useAssetSearch = ({ selectedAssets, enabled = true }: UseAssetSearchParams) => {
  const [filters, setFilters] = useState<AssetSearchFilters>({
    type: 'all',
    searchTerm: '',
    status: 'available'
  });

  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  // Buscar ativos com base nos filtros
  const { data: assets = [], isLoading, error } = useQuery({
    queryKey: ['unified-asset-search', filters.type, debouncedSearchTerm, filters.status],
    queryFn: async () => {
      let query = supabase
        .from('assets')
        .select(`
          uuid, serial_number, model, iccid, solution_id, status_id, 
          line_number, radio, manufacturer_id, created_at,
          manufacturers(id, name),
          asset_status(id, status),
          asset_solutions(id, solution)
        `)
        .is('deleted_at', null);

      // Filtro por status
      if (filters.status === 'available') {
        query = query.eq('status_id', 1);
      }

      // Filtro por tipo
      if (filters.type === 'chip') {
        query = query.eq('solution_id', 11);
      } else if (filters.type === 'equipment') {
        query = query.neq('solution_id', 11);
      }

      // Filtro por busca
      if (debouncedSearchTerm.trim()) {
        const term = debouncedSearchTerm.trim();
        const isNumeric = /^\d+$/.test(term);
        
        if (isNumeric) {
          const numericValue = parseInt(term);
          query = query.or(
            `line_number.eq.${numericValue},` +
            `iccid.ilike.%${term}%,` +
            `radio.ilike.%${term}%,` +
            `serial_number.ilike.%${term}%,` +
            `model.ilike.%${term}%`
          );
        } else {
          query = query.or(
            `iccid.ilike.%${term}%,` +
            `radio.ilike.%${term}%,` +
            `serial_number.ilike.%${term}%,` +
            `model.ilike.%${term}%`
          );
        }
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;

      return (data || []).map(convertToSelectedAsset);
    },
    enabled: enabled,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  // Converter asset do banco para SelectedAsset
  const convertToSelectedAsset = useCallback((asset: any): SelectedAsset => {
    return {
      id: asset.uuid,
      uuid: asset.uuid,
      type: asset.solution_id === 11 ? 'CHIP' : 'EQUIPMENT',
      registrationDate: asset.created_at,
      status: asset.asset_status?.status || 'DISPONÍVEL',
      statusId: asset.status_id,
      solucao: asset.asset_solutions?.solution,
      marca: asset.manufacturers?.name,
      modelo: asset.model,
      serial_number: asset.serial_number,
      model: asset.model,
      radio: asset.radio,
      solution_id: asset.solution_id,
      manufacturer_id: asset.manufacturer_id,
      iccid: asset.iccid,
      line_number: asset.line_number?.toString() || '',
      phoneNumber: asset.line_number?.toString() || '',
      carrier: 'Unknown',
      uniqueId: asset.uuid,
      brand: asset.manufacturers?.name || '',
      ssid: '#WiFi.LEGAL',
      password: '123legal',
      serialNumber: asset.serial_number || '',
      gb: 0,
      notes: '',
      rented_days: 0,
      admin_user: 'admin',
      admin_pass: '',
      plan_id: 1
    };
  }, []);

  // Buscar ativo específico por termo exato
  const searchSpecificAsset = useCallback(async (searchTerm: string, assetType: 'chip' | 'equipment') => {
    if (!searchTerm.trim()) {
      toast.error('Digite um valor para buscar');
      return null;
    }

    try {
      let query = supabase
        .from('assets')
        .select(`
          uuid, serial_number, model, iccid, solution_id, status_id, 
          line_number, radio, manufacturer_id, created_at,
          manufacturers(id, name),
          asset_status(id, status),
          asset_solutions(id, solution)
        `)
        .is('deleted_at', null)
        .eq('status_id', 1);

      if (assetType === 'chip') {
        query = query.eq('solution_id', 11).ilike('iccid', `${searchTerm.trim()}%`);
      } else {
        query = query.neq('solution_id', 11).eq('radio', searchTerm.trim());
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error(`${assetType === 'chip' ? 'CHIP' : 'Equipamento'} não encontrado ou não disponível`);
        } else {
          throw error;
        }
        return null;
      }

      return convertToSelectedAsset(data);
    } catch (error) {
      console.error('Erro na busca específica:', error);
      toast.error('Erro ao buscar ativo');
      return null;
    }
  }, [convertToSelectedAsset]);

  // Validar se ativo pode ser selecionado
  const validateAssetSelection = useCallback(async (asset: SelectedAsset): Promise<boolean> => {
    // Verificar se já foi selecionado
    if (selectedAssets.some(selected => selected.uuid === asset.uuid)) {
      toast.error('Este ativo já foi selecionado');
      return false;
    }

    // Verificar se está associado atualmente
    const { data: associationCheck } = await supabase
      .from('asset_client_assoc')
      .select('id')
      .eq('asset_id', asset.uuid)
      .is('exit_date', null)
      .limit(1);

    if (associationCheck && associationCheck.length > 0) {
      toast.error('Este ativo já está associado a outro cliente');
      return false;
    }

    return true;
  }, [selectedAssets]);

  // Filtros disponíveis
  const availableAssets = useMemo(() => {
    return assets.filter(asset => 
      !selectedAssets.some(selected => selected.uuid === asset.uuid)
    );
  }, [assets, selectedAssets]);

  return {
    filters,
    setFilters,
    assets: availableAssets,
    isLoading,
    error,
    searchSpecificAsset,
    validateAssetSelection,
    convertToSelectedAsset
  };
};
