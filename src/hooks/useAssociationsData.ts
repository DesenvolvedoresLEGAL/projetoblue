
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SearchType } from '@/hooks/useSearchTypeDetection';
import { Association, StatusFilterType } from '@/types/associations';
import { sanitizeSearchTerm } from '@/utils/associationsUtils';

interface UseAssociationsDataProps {
  debouncedSearchTerm: string;
  searchType: SearchType;
  statusFilter: StatusFilterType;
  currentPage: number;
  entryDateFrom?: Date;
  entryDateTo?: Date;
  exitDateFrom?: Date;
  exitDateTo?: Date;
  dateValidationError: string | null;
  itemsPerPage: number;
}

// Função para aplicar filtro de busca no Supabase baseado no tipo detectado
const applySupabaseSearch = (query: any, term: string, type: SearchType) => {
  if (!term || type === 'empty') return query;

  const sanitized = sanitizeSearchTerm(term);
  if (!sanitized) return query;

  switch (type) {
    case 'id':
      return query.eq('id', parseInt(sanitized));
    case 'iccid':
      return query.ilike('assets.iccid', `%${sanitized}%`);
    case 'radio':
      return query.ilike('assets.radio', `%${sanitized}%`);
    case 'client_name':
    default:
      return query.ilike('clients.nome', `%${sanitized}%`);
  }
};

export const useAssociationsData = ({
  debouncedSearchTerm,
  searchType,
  statusFilter,
  currentPage,
  entryDateFrom,
  entryDateTo,
  exitDateFrom,
  exitDateTo,
  dateValidationError,
  itemsPerPage
}: UseAssociationsDataProps) => {
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: [
      'associations-list-optimized', 
      debouncedSearchTerm,
      searchType,
      statusFilter, 
      currentPage,
      entryDateFrom?.toISOString(),
      entryDateTo?.toISOString(),
      exitDateFrom?.toISOString(),
      exitDateTo?.toISOString()
    ],
    queryFn: async () => {
      // Não executar query se há erro de validação de datas
      if (dateValidationError) {
        return { data: [], count: 0 };
      }

      let query = supabase
        .from('asset_client_assoc')
        .select(`
          id,
          asset_id,
          client_id,
          entry_date,
          exit_date,
          association_id,
          created_at,
          clients!inner(nome),
          assets!inner(
            iccid,
            radio,
            line_number,
            solution_id,
            asset_solutions(solution)
          )
        `, { count: 'exact' })
        .is('deleted_at', null);

      // Aplicar filtro por status
      if (statusFilter === 'active') {
        query = query.or(`exit_date.is.null,exit_date.gt.${today}`);
      } else if (statusFilter === 'ended') {
        query = query
          .not('exit_date', 'is', null)
          .lte('exit_date', today);
      } else if (statusFilter === 'today') {
        query = query.eq('exit_date', today);
      }

      // Aplicar filtros por data
      if (entryDateFrom) {
        query = query.gte('entry_date', entryDateFrom.toISOString().split('T')[0]);
      }
      if (entryDateTo) {
        query = query.lte('entry_date', entryDateTo.toISOString().split('T')[0]);
      }
      if (exitDateFrom) {
        query = query.gte('exit_date', exitDateFrom.toISOString().split('T')[0]);
      }
      if (exitDateTo) {
        query = query.lte('exit_date', exitDateTo.toISOString().split('T')[0]);
      }

      // Aplicar busca principal no Supabase
      query = applySupabaseSearch(query, debouncedSearchTerm, searchType);

      // Adicionar ordenação e paginação
      query = query.order('entry_date', { ascending: false });

      // Paginação
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = currentPage * itemsPerPage - 1;
      query = query.range(startIndex, endIndex);

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar associações:', error);
        throw error;
      }

      // Mapear dados para o formato esperado com line_number incluído
      const mappedData: Association[] = data.map((item: any) => ({
        id: item.id,
        asset_id: item.asset_id,
        client_id: item.client_id,
        entry_date: item.entry_date,
        exit_date: item.exit_date,
        association_id: item.association_id,
        created_at: item.created_at,
        client_name: item.clients?.nome || 'Cliente não encontrado',
        asset_iccid: item.assets?.iccid,
        asset_radio: item.assets?.radio,
        asset_line_number: item.assets?.line_number,
        asset_solution_id: item.assets?.solution_id,
        asset_solution_name: item.assets?.asset_solutions?.solution || 'Solução não encontrada'
      }));

      return {
        data: mappedData,
        count: count || 0
      };
    },
    enabled: true
  });
};
