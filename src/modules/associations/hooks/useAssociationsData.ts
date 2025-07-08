
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { SearchType } from '@/hooks/useSearchTypeDetection';
import { Association, StatusFilterType } from '@/types/associations';
import { sanitizeSearchTerm } from '@/utils/associationsUtils';
import { safedParseInt } from '@/utils/stringUtils';

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

interface AssociationQueryRow {
  id: number;
  equipment_id: string | null;
  chip_id: string | null;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  association_id: number;
  created_at: string;
  clients?: { empresa?: string } | null;
  assets?: {
    iccid?: string | null;
    radio?: string | null;
    line_number?: number | null;
    solution_id: number;
    asset_solutions?: { solution?: string } | null;
  } | null;
}

// Função para aplicar filtro de busca no Supabase apenas para campos específicos (não busca geral)
const applySupabaseSearch = (
  query: PostgrestFilterBuilder<unknown, Record<string, unknown>, unknown, unknown, unknown>,
  term: string,
  type: SearchType
) => {
  if (!term || type === 'empty') return query;

  const sanitized = sanitizeSearchTerm(term);
  if (!sanitized) return query;

  if (type !== 'client_name') {
    query.or(
      `iccid.like.%${sanitized}%,radio.like.%${sanitized.toUpperCase()}%,line_number.eq.${safedParseInt(sanitized)}`,
      {'foreignTable': 'assets'}
    );
  } else {
    query.or(
      `nome.like.%${sanitized}%`,
      {'foreignTable': 'clients'}
    );
  }

  return query;
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
        .from('associations')
        .select(`
          id,
          equipment_id,
          chip_id,
          client_id,
          entry_date,
          exit_date,
          association_id,
          created_at,
          clients!inner(empresa, responsavel, telefones, email),
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

      // Aplicar busca no backend apenas para tipos específicos
      // Para busca geral por cliente, deixar para o frontend
      if (debouncedSearchTerm && (searchType === 'id' || searchType === 'iccid' || searchType === 'radio')) {
        query = applySupabaseSearch(query, debouncedSearchTerm, searchType);
      }

      // Adicionar ordenação por created_at e depois por entry_date (mais recentes primeiro)
      query = query.order('created_at', { ascending: false })
                  .order('entry_date', { ascending: false });

      // Paginação
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = currentPage * itemsPerPage - 1;
      query = query.range(startIndex, endIndex);

      const { data, error, count } = await query;

      if (error) {
        if (import.meta.env.DEV) console.error('Erro ao buscar associações:', error);
        throw error;
      }

      // Mapear dados para o formato esperado com line_number incluído
      const mappedData: Association[] = data.map((item: AssociationQueryRow) => ({
        id: item.id,
        asset_id: item.equipment_id || item.chip_id,
        client_id: item.client_id,
        entry_date: item.entry_date,
        exit_date: item.exit_date,
        association_id: item.association_id,
        created_at: item.created_at,
        client_name: item.clients?.empresa || 'Cliente não encontrado',
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
