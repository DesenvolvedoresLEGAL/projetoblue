
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAssetSearch = (
  searchTerm: string = '', 
  solutionFilter: string = 'all',
  excludeAssociatedToClient?: string
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
        .eq('asset_status.status', 'Disponível'); // Apenas ativos disponíveis

      // Filtrar por solução se especificado
      if (solutionFilter !== 'all') {
        query = query.eq('solution_id', parseInt(solutionFilter));
      }

      // Aplicar busca por termo se especificado
      if (searchTerm.trim()) {
        const cleanTerm = searchTerm.trim();
        
        // Buscar em múltiplos campos
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

      return filteredAssets;
    },
    enabled: true
  });

  return {
    assets: assetsQuery.data || [],
    solutions: solutionsQuery.data || [],
    isLoading: assetsQuery.isLoading || solutionsQuery.isLoading,
    isError: assetsQuery.isError || solutionsQuery.isError,
    error: assetsQuery.error || solutionsQuery.error
  };
};
