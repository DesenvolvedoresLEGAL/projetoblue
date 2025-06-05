
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AssociationsPageHeader } from "@modules/associations/components/associations/AssociationsPageHeader";
import { StandardFiltersCard } from "@/components/ui/standard-filters-card";
import { EditAssociationDialog } from "@modules/associations/components/associations/EditAssociationDialog";
import { AssociationsFilters } from "@modules/associations/components/associations/AssociationsFilters";
import { AssociationsAdvancedGroupedTable } from "@modules/associations/components/associations/AssociationsAdvancedGroupedTable";
import { AssociationsEmpty } from "@modules/associations/components/associations/AssociationsEmpty";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchTypeDetection } from "@/hooks/useSearchTypeDetection";
import { useAssociationsData } from "@modules/associations/hooks/useAssociationsData";
import { useAssociationActions } from "@modules/associations/hooks/useAssociationActions";
import { useDateFilters } from "@/hooks/useDateFilters";
import { Association, StatusFilterType } from '@/types/associations';
import { filterMultiField } from '@/utils/associationsUtils';
import { groupAssociationsByTimestampAndCompany } from '@/utils/timestampGroupingUtils';

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
    isEndingAssociation, 
    operationProgress
  } = useAssociationActions();

  // Aplicar filtro multicampo no frontend e agrupar por timestamp e empresa
  const { timestampGroups, totalAssociations } = useMemo(() => {
    const rawData = associationsData?.data || [];
    
    // Aplicar filtro multicampo
    const filteredData = debouncedSearchTerm ? 
      filterMultiField(rawData, debouncedSearchTerm) : rawData;
    
    // Agrupar por timestamp e empresa
    const grouped = groupAssociationsByTimestampAndCompany(filteredData);
    
    return {
      timestampGroups: grouped,
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
          {/* Tabela Agrupada Avançada */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground font-neue-haas">
              Carregando associações...
            </div>
          ) : timestampGroups.length > 0 ? (
            <AssociationsAdvancedGroupedTable
              timestampGroups={timestampGroups}
              totalCount={totalCount}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onEditAssociation={handleEditAssociation}
              onEndAssociation={handleEndAssociation}
              debouncedSearchTerm={debouncedSearchTerm}
              isEndingAssociation={isEndingAssociation}
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
