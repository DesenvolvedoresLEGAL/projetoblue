
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { EditAssociationDialog } from "@/components/associations/EditAssociationDialog";
import { AssociationsFilters } from "@/components/associations/AssociationsFilters";
import { AssociationsGroupedTable } from "@/components/associations/AssociationsGroupedTable";
import { AssociationsEmpty } from "@/components/associations/AssociationsEmpty";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchTypeDetection } from "@/hooks/useSearchTypeDetection";
import { useAssociationsData } from "@/hooks/useAssociationsData";
import { useAssociationActions } from "@/hooks/useAssociationActions";
import { useDateFilters } from "@/hooks/useDateFilters";
import { Association, StatusFilterType } from '@/types/associations';
import { filterMultiField, groupAssociationsByClientAndDates } from '@/utils/associationsUtils';

export default function AssociationsListContent() {
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAssociation, setEditingAssociation] = useState<Association | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const navigate = useNavigate();
  const itemsPerPage = 100;
  
  // Debounce para o termo de busca e detecção de tipo
  const debouncedSearchTerm = useDebounce(searchInput.trim(), 500);
  const searchType = useSearchTypeDetection(debouncedSearchTerm);
  
  // Date filters hook
  const {
    entryDateFrom,
    setEntryDateFrom,
    entryDateTo,
    setEntryDateTo,
    exitDateFrom,
    setExitDateFrom,
    exitDateTo,
    setExitDateTo,
    showDateFilters,
    setShowDateFilters,
    dateValidationError,
    clearDateFilters,
    hasActiveDateFilters
  } = useDateFilters();

  // Data fetching
  const { data: associationsData, isLoading, error } = useAssociationsData({
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
  });

  // Actions com controle melhorado
  const { 
    handleEndAssociation, 
    handleEndGroup, 
    isEndingAssociation, 
    isEndingGroup,
    operationProgress
  } = useAssociationActions();

  // Aplicar filtro multicampo no frontend e agrupar por cliente e datas
  const { groupedAssociations, totalAssociations } = useMemo(() => {
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

  // Handler para encerrar grupo com access aos grouped associations
  const handleEndGroupWithData = (groupKey: string) => {
    console.log('[AssociationsListContent] Iniciando encerramento do grupo:', groupKey);
    handleEndGroup(groupKey, groupedAssociations);
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
            disabled={isEndingGroup}
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
              {isEndingGroup && " - Operação em andamento..."}
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
              onEndGroup={handleEndGroupWithData}
              debouncedSearchTerm={debouncedSearchTerm}
              isEndingAssociation={isEndingAssociation}
              isEndingGroup={isEndingGroup}
              operationProgress={operationProgress}
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
