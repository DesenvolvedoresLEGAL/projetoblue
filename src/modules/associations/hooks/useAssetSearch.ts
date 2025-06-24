
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SelectedAsset } from '@modules/associations/types';
import { toast } from '@/utils/toast';

export interface AssetSearchFilters {
  type: 'all' | 'equipment' | 'chip';
  searchTerm: string;
  status: 'available' | 'all';
}

export const useAssetSearch = (
  searchTerm: string = '', 
  solutionFilter: string = 'all',
  excludeAssociatedToClient?: string,
  options?: { selectedAssets?: SelectedAsset[] }
) => {
  // Query para buscar soluções
  const solutionsQuery = useQuery({
    queryKey: ['asset-solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_solutions')
        .select('id, solution')
        .order('solution');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Query para buscar ativos
  const assetsQuery = useQuery({
    queryKey: ['available-assets', searchTerm, solutionFilter, excludeAssociatedToClient],
    queryFn: async () => {
      let query = supabase
        .from('assets')
        .select(`
          uuid,
          serial_number,
          radio,
          line_number,
          iccid,
          solution_id,
          status_id,
          created_at,
          asset_solutions!inner(
            id,
            solution
          ),
          asset_status!inner(
            id,
            status
          )
        `)
        .is('deleted_at', null)
        .eq('asset_status.status', 'Disponível');

      // Filtrar por solução se especificado
      if (solutionFilter !== 'all') {
        query = query.eq('solution_id', parseInt(solutionFilter));
      }

      // Aplicar busca por termo se especificado
      if (searchTerm.trim()) {
        const cleanTerm = searchTerm.trim();
        
        query = query.or(`
          radio.ilike.%${cleanTerm}%,
          serial_number.ilike.%${cleanTerm}%,
          iccid.ilike.%${cleanTerm}%,
          line_number.eq.${cleanTerm}
        `);
      }

      const { data: assets, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      let filteredAssets = assets || [];

      // Excluir ativos já associados ao cliente específico, se fornecido
      if (excludeAssociatedToClient) {
        const { data: associatedAssets, error: assocError } = await supabase
          .from('asset_client_assoc')
          .select('asset_id')
          .eq('client_id', excludeAssociatedToClient)
          .is('exit_date', null)
          .is('deleted_at', null);

        if (assocError) throw assocError;

        const associatedAssetIds = new Set(
          (associatedAssets || []).map(a => a.asset_id)
        );

        filteredAssets = filteredAssets.filter(
          asset => !associatedAssetIds.has(asset.uuid)
        );
      }

      // Mapear para SelectedAsset format
      return filteredAssets.map(asset => ({
        id: asset.uuid,
        uuid: asset.uuid,
        type: asset.iccid ? 'CHIP' : 'EQUIPMENT' as 'CHIP' | 'EQUIPMENT',
        registrationDate: asset.created_at,
        status: asset.asset_status.status,
        statusId: asset.status_id,
        radio: asset.radio,
        serial_number: asset.serial_number,
        iccid: asset.iccid,
        line_number: asset.line_number?.toString(),
        solution_id: asset.solution_id,
        solucao: asset.asset_solutions.solution
      })) as SelectedAsset[];
    },
    enabled: true
  });

  // Função para buscar ativo específico
  const searchSpecificAsset = async (term: string, type: 'chip' | 'equipment'): Promise<SelectedAsset | null> => {
    try {
      let query = supabase
        .from('assets')
        .select(`
          uuid,
          serial_number,
          radio,
          line_number,
          iccid,
          solution_id,
          status_id,
          created_at,
          asset_solutions!inner(solution),
          asset_status!inner(status)
        `)
        .is('deleted_at', null)
        .eq('asset_status.status', 'Disponível');

      if (type === 'chip') {
        query = query.ilike('iccid', `%${term}%`).not('iccid', 'is', null);
      } else {
        query = query.eq('radio', term);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error(`${type === 'chip' ? 'CHIP' : 'Equipamento'} não encontrado`);
          return null;
        }
        throw error;
      }

      return {
        id: data.uuid,
        uuid: data.uuid,
        type: data.iccid ? 'CHIP' : 'EQUIPMENT',
        registrationDate: data.created_at,
        status: data.asset_status.status,
        statusId: data.status_id,
        radio: data.radio,
        serial_number: data.serial_number,
        iccid: data.iccid,
        line_number: data.line_number?.toString(),
        solution_id: data.solution_id,
        solucao: data.asset_solutions.solution
      } as SelectedAsset;
    } catch (error) {
      console.error('Erro ao buscar ativo específico:', error);
      toast.error('Erro ao buscar ativo');
      return null;
    }
  };

  // Função para validar seleção de ativo
  const validateAssetSelection = async (asset: SelectedAsset): Promise<boolean> => {
    if (options?.selectedAssets?.some(selected => selected.uuid === asset.uuid)) {
      toast.warning('Este ativo já foi selecionado');
      return false;
    }
    return true;
  };

  return {
    assets: assetsQuery.data || [],
    solutions: solutionsQuery.data || [],
    isLoading: assetsQuery.isLoading || solutionsQuery.isLoading,
    isError: assetsQuery.isError || solutionsQuery.isError,
    error: assetsQuery.error || solutionsQuery.error,
    searchSpecificAsset,
    validateAssetSelection
  };
};
