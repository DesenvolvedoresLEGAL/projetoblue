
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AssociationsPageHeader } from "@/components/associations/AssociationsPageHeader";
import { StandardFiltersCard } from "@/components/ui/standard-filters-card";
import { EditAssociationDialog } from "@/components/associations/EditAssociationDialog";
import { AssociationsFilters } from "@/components/associations/AssociationsFilters";
import { AssociationsGroupedTable } from "@/components/associations/AssociationsGroupedTable";
import { AssociationsDateGroupedTable } from "@/components/associations/AssociationsDateGroupedTable";
import { AssociationsEmpty } from "@/components/associations/AssociationsEmpty";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchTypeDetection } from "@/hooks/useSearchTypeDetection";
import { useAssociationsData } from "@/hooks/useAssociationsData";
import { useAssociationActions } from "@/hooks/useAssociationActions";
import { useDateFilters } from "@/hooks/useDateFilters";
import { Association, StatusFilterType } from '@/types/associations';
import { filterMultiField, groupAssociationsByClientAndDates } from '@/utils/associationsUtils';
import { groupAssociationsByCreatedDate, shouldShowDateGrouping } from '@/utils/dateGroupingUtils';

export default function AssociationsListContent() {
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAssociation, setEditingAssociation] = useState<Association | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
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

  // Aplicar filtro multicampo no frontend e processar agrupamentos
  const { groupedAssociations, dateGroups, totalAssociations, showDateGrouping } = useMemo(() => {
    const rawData = associationsData?.data || [];
    
    // Aplicar filtro multicampo
    const filteredData = debouncedSearchTerm ? 
      filterMultiField(rawData, debouncedSearchTerm) : rawData;
    
    // Agrupar por cliente e datas
    const grouped = groupAssociationsByClientAndDates(filteredData);
    
    // Agrupar por data de criação
    const dateGroups = groupAssociationsByCreatedDate(filteredData);
    
    // Verificar se deve mostrar agrupamento por data
    const showDateGrouping = shouldShowDateGrouping(dateGroups);
    
    return {
      groupedAssociations: grouped,
      dateGroups,
      totalAssociations: filteredData.length,
      showDateGrouping
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

  // Mock function for export (can be implemented later)
  const handleExport = () => {
    console.log('Export functionality to be implemented');
  };

  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <AssociationsPageHeader totalCount={totalCount} />
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground font-neue-haas">
            Erro ao carregar associações. Tente novamente.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AssociationsPageHeader 
        totalCount={totalCount}
        onExport={handleExport}
        isExporting={false}
      />

      <StandardFiltersCard title="Filtros de Associações">
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
      </StandardFiltersCard>

      <Card className="shadow-sm">
        <CardContent className="space-y-6 pt-6">
          {/* Tabela com ou sem agrupamento por data */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground font-neue-haas">
              Carregando associações...
            </div>
          ) : Object.keys(groupedAssociations).length > 0 ? (
            showDateGrouping ? (
              <AssociationsDateGroupedTable
                dateGroups={dateGroups}
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
            )
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
