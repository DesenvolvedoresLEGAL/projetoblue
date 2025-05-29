
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { EditAssociationDialog } from "@/components/associations/EditAssociationDialog";
import { AssociationsFilters } from "@/components/associations/AssociationsFilters";
import { AssociationsGroupedTable } from "@/components/associations/AssociationsGroupedTable";
import { AssociationsEmpty } from "@/components/associations/AssociationsEmpty";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchTypeDetection, SearchType } from "@/hooks/useSearchTypeDetection";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

interface Association {
  id: number;
  asset_id: string;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  association_id: number;
  created_at: string;
  // Dados dos JOINs
  client_name: string;
  asset_iccid: string | null;
  asset_radio: string | null;
  asset_line_number: number | null;
  asset_solution_id: number;
  asset_solution_name: string;
}

// Função para filtro multicampo que funciona com a interface Association
const filterMultiField = (
  associations: Association[],
  searchTerm: string
): Association[] => {
  if (!searchTerm.trim()) return associations;
  
  const term = searchTerm.toLowerCase();
  
  return associations.filter(association => {
    // Busca em ID
    if (association.id.toString().includes(term)) return true;
    
    // Busca em nome do cliente
    if (association.client_name.toLowerCase().includes(term)) return true;
    
    // Busca em ICCID
    if (association.asset_iccid?.toLowerCase().includes(term)) return true;
    
    // Busca em rádio
    if (association.asset_radio?.toLowerCase().includes(term)) return true;
    
    // Busca em linha
    if (association.asset_line_number?.toString().includes(term)) return true;
    
    // Busca em nome da solução
    if (association.asset_solution_name.toLowerCase().includes(term)) return true;
    
    return false;
  });
};

// Função para agrupamento melhorado por cliente e datas
const groupAssociationsByClientAndDates = (associations: Association[]) => {
  const groups: { [key: string]: {
    groupKey: string;
    client_name: string;
    client_id: string;
    entry_date: string;
    exit_date: string | null;
    associations: Association[];
    totalAssets: number;
    assetTypes: { [key: string]: number };
    canEndGroup: boolean;
  } } = {};

  associations.forEach(association => {
    const groupKey = `${association.client_id}_${association.entry_date}_${association.exit_date || 'null'}`;
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        groupKey,
        client_name: association.client_name,
        client_id: association.client_id,
        entry_date: association.entry_date,
        exit_date: association.exit_date,
        associations: [],
        totalAssets: 0,
        assetTypes: {},
        canEndGroup: true
      };
    }
    
    groups[groupKey].associations.push(association);
    groups[groupKey].totalAssets++;
    
    // Contar tipos de ativos
    const assetType = association.asset_solution_name;
    groups[groupKey].assetTypes[assetType] = (groups[groupKey].assetTypes[assetType] || 0) + 1;
    
    // Verificar se pode encerrar o grupo (função canBeEndedManually inline)
    const canEnd = !association.exit_date || association.exit_date >= new Date().toISOString().split('T')[0];
    if (!canEnd) {
      groups[groupKey].canEndGroup = false;
    }
  });
  
  return groups;
};

export default function AssociationsList() {
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ended' | 'today'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  
  // Estados para filtros de data
  const [entryDateFrom, setEntryDateFrom] = useState<Date | undefined>();
  const [entryDateTo, setEntryDateTo] = useState<Date | undefined>();
  const [exitDateFrom, setExitDateFrom] = useState<Date | undefined>();
  const [exitDateTo, setExitDateTo] = useState<Date | undefined>();
  
  // Estado para controlar a visibilidade dos filtros de data
  const [showDateFilters, setShowDateFilters] = useState(false);
  
  // Estados para validação de datas
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);
  
  // Estados para o modal de edição
  const [editingAssociation, setEditingAssociation] = useState<Association | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Debounce para o termo de busca e detecção de tipo
  const debouncedSearchTerm = useDebounce(searchInput.trim(), 500);
  const searchType = useSearchTypeDetection(debouncedSearchTerm);
  
  const itemsPerPage = 100; // Aumentado para melhor eficiência do filtro frontend
  const today = new Date().toISOString().split('T')[0];

  // Função para encerrar associação
  const handleEndAssociation = async (associationId: number) => {
    try {
      const { error } = await supabase
        .from('asset_client_assoc')
        .update({ 
          exit_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', associationId);

      if (error) {
        console.error('Erro ao encerrar associação:', error);
        toast.error('Erro ao encerrar associação');
        return;
      }

      toast.success('Associação encerrada com sucesso');
      // A query será revalidada automaticamente devido ao queryKey
    } catch (error) {
      console.error('Erro ao encerrar associação:', error);
      toast.error('Erro ao encerrar associação');
    }
  };

  // Função para encerrar grupo de associações
  const handleEndGroup = async (groupKey: string) => {
    try {
      const group = groupedAssociations[groupKey];
      const associationIds = group.associations.map(a => a.id);
      
      const { error } = await supabase
        .from('asset_client_assoc')
        .update({ 
          exit_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .in('id', associationIds);

      if (error) {
        console.error('Erro ao encerrar grupo de associações:', error);
        toast.error('Erro ao encerrar grupo de associações');
        return;
      }

      toast.success(`Grupo de ${group.totalAssets} associações encerrado com sucesso`);
    } catch (error) {
      console.error('Erro ao encerrar grupo de associações:', error);
      toast.error('Erro ao encerrar grupo de associações');
    }
  };

  // Validação automática de datas
  useEffect(() => {
    let error = null;

    if (entryDateFrom && entryDateTo && entryDateFrom > entryDateTo) {
      error = 'A data inicial de entrada não pode ser maior que a data final';
    }

    if (exitDateFrom && exitDateTo && exitDateFrom > exitDateTo) {
      error = 'A data inicial de saída não pode ser maior que a data final';
    }

    if (entryDateFrom && exitDateTo && exitDateTo < entryDateFrom) {
      error = 'A data de saída não pode ser anterior à data de entrada';
    }

    setDateValidationError(error);
  }, [entryDateFrom, entryDateTo, exitDateFrom, exitDateTo]);

  // Função para limpar todos os filtros de data
  const clearDateFilters = () => {
    setEntryDateFrom(undefined);
    setEntryDateTo(undefined);
    setExitDateFrom(undefined);
    setExitDateTo(undefined);
    setDateValidationError(null);
  };

  // Função para verificar se há filtros de data ativos - CORRIGIDA para retornar boolean
  const hasActiveDateFilters = (): boolean => {
    return !!(entryDateFrom || entryDateTo || exitDateFrom || exitDateTo);
  };

  // Função para sanitizar termo de busca
  const sanitizeSearchTerm = (term: string) => {
    if (!term) return '';
    return term.replace(/['"\\%_]/g, '').trim();
  };

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

  // Buscar associações com query melhorada
  const { data: associationsData, isLoading, error } = useQuery({
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
      const mappedData = data.map((item: any) => ({
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

  // Aplicar filtro multicampo no frontend e agrupar por cliente e datas
  const { groupedAssociations, totalAssociations } = React.useMemo(() => {
    const rawData = associationsData?.data || [];
    
    // Aplicar filtro multicampo
    const filteredData = debouncedSearchTerm ? 
      filterMultiField(rawData, debouncedSearchTerm) : rawData;
    
    // Agrupar por cliente e datas
    const grouped = groupAssociationsByClientAndDates(filteredData);
    
    return {
      groupedAssociations: grouped,
      totalAssociations: filteredData.length
    };
  }, [associationsData?.data, debouncedSearchTerm]);

  const totalCount = associationsData?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Função para abrir o modal de edição
  const handleEditAssociation = (association: Association) => {
    setEditingAssociation(association);
    setIsEditDialogOpen(true);
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Associações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Erro ao carregar associações. Tente novamente.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className='border-none bg-none-1 shadow-none'>
        <CardHeader className='flex flex-row gap-4 items-center'>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/assets`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex flex-col">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Associações
            </CardTitle>
            <CardDescription>
              Consulte todas as associações entre ativos e clientes, agrupadas por cliente
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <AssociationsFilters
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            debouncedSearchTerm={debouncedSearchTerm}
            searchType={searchType}
            showDateFilters={showDateFilters}
            setShowDateFilters={setShowDateFilters}
            entryDateFrom={entryDateFrom}
            setEntryDateFrom={setEntryDateFrom}
            entryDateTo={entryDateTo}
            setEntryDateTo={setEntryDateTo}
            exitDateFrom={exitDateFrom}
            setExitDateFrom={setExitDateFrom}
            exitDateTo={exitDateTo}
            setExitDateTo={setExitDateTo}
            dateValidationError={dateValidationError}
            hasActiveDateFilters={hasActiveDateFilters}
            clearDateFilters={clearDateFilters}
          />

          {/* Tabela Agrupada */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando associações...
            </div>
          ) : Object.keys(groupedAssociations).length > 0 ? (
            <AssociationsGroupedTable
              groupedAssociations={groupedAssociations}
              totalCount={totalCount}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onEditAssociation={handleEditAssociation}
              onEndAssociation={handleEndAssociation}
              onEndGroup={handleEndGroup}
              debouncedSearchTerm={debouncedSearchTerm}
            />
          ) : (
            <AssociationsEmpty
              debouncedSearchTerm={debouncedSearchTerm}
              statusFilter={statusFilter}
              hasActiveDateFilters={hasActiveDateFilters()}
              dateValidationError={dateValidationError}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <EditAssociationDialog
        association={editingAssociation}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}
