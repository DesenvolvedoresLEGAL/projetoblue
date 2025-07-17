
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Users, Phone, Building, Smartphone, Router } from 'lucide-react';
import { useAssociationsList } from '../hooks/useAssociationsList';
import { useEndAssociation } from '../hooks/useEndAssociation';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useAssociationFilters } from '../hooks/useAssociationFilters';
import { useAssociationTypes } from '../hooks/useAssociationTypes';
import { formatPhone } from '../utils/associationFormatters';
import ExpandedAssociations from '../components/ExpandedAssociations';
import EndAssociationModal from '../components/EndAssociationModal';
import AssociationsListSkeleton from '../components/AssociationsListSkeleton';
import { SearchBar } from '../components/SearchBar';
import { PaginationControls } from '../components/PaginationControls';
import { SearchResultHighlight } from '../components/SearchResultHighlight';
import { useAssociationsSearch } from '../hooks/useAssociationsSearch';
import { usePagination } from '../hooks/usePagination';
import { AssociationWithRelations } from '../types/associationsTypes';
import ChipTypeIndicator from '../components/ChipTypeIndicator';
import EmptyState from '../components/states/EmptyState';
import MobileStats from '../components/mobile/MobileStats';
import MobileFilters from '../components/mobile/MobileFilters';
import AssociationCard from '../components/mobile/AssociationCard';
import AssociationFilters from '../components/filters/AssociationFilters';
import { toast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 11;

const AssociationsList: React.FC = () => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssociation, setSelectedAssociation] = useState<AssociationWithRelations | null>(null);
  const [endingAssociationId, setEndingAssociationId] = useState<string | null>(null);

  const { isMobile } = useResponsiveLayout();
  const { clientGroups, stats, loading, initialLoading, error, refresh } = useAssociationsList();
  const { data: associationTypes = [] } = useAssociationTypes();

  // Aplicar filtros primeiro
  const {
    filters,
    filteredGroups: filteredByFilters,
    statusOptions,
    associationTypeOptions,
    updateFilter,
    clearFilters,
    hasActiveFilters
  } = useAssociationFilters({
    clientGroups,
    associationTypes
  });

  // Depois aplicar busca nos dados já filtrados
  const {
    filteredGroups,
    searchType,
    totalMatches,
    isSearching
  } = useAssociationsSearch({
    clientGroups: filteredByFilters,
    searchTerm
  });

  const {
    currentPage,
    totalPages,
    paginatedData,
    startIndex,
    endIndex,
    totalItems,
    goToPage,
    canGoNext,
    canGoPrevious
  } = usePagination({
    data: filteredGroups,
    itemsPerPage: ITEMS_PER_PAGE
  });

  const { endAssociation, isLoading: isEndingAssociation } = useEndAssociation({
    onSuccess: () => {
      setSelectedAssociation(null);
      setEndingAssociationId(null);
      refresh();
      toast({
        title: "Sucesso",
        description: "A associação foi finalizada com sucesso.",
      });
    }
  });

  // Navegação por teclado
  useKeyboardNavigation({
    onEscape: () => {
      if (selectedAssociation) {
        setSelectedAssociation(null);
      }
    },
    isEnabled: true
  });

  const toggleRow = (clientId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedRows(newExpanded);
  };

  const handleEndAssociation = (association: AssociationWithRelations) => {
    setSelectedAssociation(association);
  };

  const handleConfirmEndAssociation = async (exitDate: string, notes?: string) => {
    if (!selectedAssociation) return;

    try {
      setEndingAssociationId(selectedAssociation.uuid);
      await endAssociation(selectedAssociation, exitDate, notes);
    } catch (error) {
      setEndingAssociationId(null);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a associação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleClearAllFilters = () => {
    clearFilters();
    setSearchTerm('');
  };

  // Loading inicial com skeleton
  if (initialLoading) {
    return <AssociationsListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState type="error" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border p-4 md:p-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">
            Listagem de Associações
          </h1>
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          Visualize e gerencie todas as associações de clientes com seus equipamentos e chips
        </p>

        {/* Stats - Mobile vs Desktop */}
        {isMobile ? (
          <div className="mt-4">
            <MobileStats stats={stats} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Total de Clientes</div>
              <div className="text-2xl font-semibold text-foreground">{stats.totalClients}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Total de Associações</div>
              <div className="text-2xl font-semibold text-foreground">{stats.totalAssociations}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Associações Ativas</div>
              <div className="text-2xl font-semibold text-green-600">{stats.activeAssociations}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center">
              <div className="text-sm text-muted-foreground text-center">Chips + SPEEDY</div>
              <div className="text-2xl font-semibold text-blue-600 flex items-center gap-1">
                <Smartphone className="h-5 w-5" />
                {stats.principalChips}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center">
              <div className="text-sm text-muted-foreground text-center">Chips Backup</div>
              <div className="text-2xl font-semibold text-purple-600 flex items-center gap-1">
                <Smartphone className="h-5 w-5" />
                {stats.backupChips}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center">
              <div className="text-sm text-muted-foreground text-center">Só Equipamentos</div>
              <div className="text-2xl font-semibold text-orange-600 flex items-center gap-1">
                <Router className="h-5 w-5" />
                {stats.equipmentOnly}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      {!isMobile && (
        <AssociationFilters
          filters={filters}
          statusOptions={statusOptions}
          associationTypeOptions={associationTypeOptions}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Search Bar - Mobile vs Desktop */}
      {isMobile ? (
        <MobileFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchType={searchType}
          isSearching={isSearching}
          totalMatches={totalMatches}
        />
      ) : (
        <div className="bg-card rounded-lg border p-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchType={searchType}
            isSearching={isSearching}
            totalMatches={totalMatches}
          />
        </div>
      )}

      {/* Content - Mobile Cards vs Desktop Table */}
      {paginatedData.length === 0 ? (
        <div className="bg-card rounded-lg border p-8">
          <EmptyState
            type={searchTerm.trim() || hasActiveFilters ? 'search' : 'no-data'}
            searchTerm={searchTerm}
            onClearSearch={searchTerm.trim() || hasActiveFilters ? handleClearAllFilters : undefined}
          />
        </div>
      ) : isMobile ? (
        <div className="space-y-4">
          {paginatedData.map((group) => (
            <AssociationCard
              key={group.client.uuid}
              group={group}
              onEndAssociation={handleEndAssociation}
              endingAssociationId={endingAssociationId}
              searchTerm={searchTerm}
              searchType={searchType}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Cliente</th>
                  <th className="text-left p-4 font-medium text-foreground">Associações</th>
                  <th className="text-left p-4 font-medium text-foreground">Tipos</th>
                  <th className="text-left p-4 font-medium text-foreground">Contato</th>
                  <th className="text-left p-4 font-medium text-foreground">Responsável</th>
                  <th className="w-12 p-4"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.flatMap((group) => {
                  const mainRow = (
                    <tr
                      key={`client-${group.client.uuid}`}
                      className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => toggleRow(group.client.uuid)}
                    >
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            <SearchResultHighlight
                              text={group.client.nome}
                              searchTerm={searchType === 'client_name' ? searchTerm : ''}
                            />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building className="h-4 w-4" />
                            <SearchResultHighlight
                              text={group.client.empresa}
                              searchTerm={searchType === 'client_name' ? searchTerm : ''}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{group.totalAssociations}</div>
                          <div className="text-sm text-muted-foreground">
                            <span className="text-green-600">{group.activeAssociations} ativas</span>
                            {group.inactiveAssociations > 0 && (
                              <span className="text-muted-foreground"> • {group.inactiveAssociations} inativas</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {group.principalChips > 0 && (
                            <ChipTypeIndicator chipType="principal" className="text-xs" />
                          )}
                          {group.backupChips > 0 && (
                            <ChipTypeIndicator chipType="backup" className="text-xs" />
                          )}
                          {group.equipmentOnly > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                              <Router className="h-3 w-3" />
                              {group.equipmentOnly}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{formatPhone(group.client.contato)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-foreground">{group.client.responsavel}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          {expandedRows.has(group.client.uuid) ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );

                  if (expandedRows.has(group.client.uuid)) {
                    return [
                      mainRow,
                      <tr key={`expanded-${group.client.uuid}`} className="animate-fade-in">
                        <td colSpan={6} className="p-0">
                          <ExpandedAssociations
                            associations={group.associations}
                            clientName={group.client.nome}
                            onEndAssociation={handleEndAssociation}
                            endingAssociationId={endingAssociationId}
                          />
                        </td>
                      </tr>
                    ];
                  }

                  return [mainRow];
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredGroups.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
          className="bg-card rounded-lg border p-4 md:p-6"
        />
      )}

      {/* Footer com informações */}
      <div className="text-sm text-muted-foreground text-center">
        {searchTerm.trim() || hasActiveFilters ? (
          <>
            Mostrando {totalMatches} {totalMatches === 1 ? 'cliente' : 'clientes'} encontrado
            {totalMatches !== 1 ? 's' : ''} de {stats.totalClients} total
            {hasActiveFilters && ' (com filtros aplicados)'}
          </>
        ) : (
          <>
            Mostrando {stats.totalClients} clientes com{' '}
            {stats.totalAssociations} associações ({stats.principalChips} chips + SPEEDY, {stats.backupChips} chips backup, {stats.equipmentOnly} só equipamentos)
          </>
        )}
      </div>

      {/* Modal de Finalizar Associação */}
      <EndAssociationModal
        isOpen={!!selectedAssociation}
        onOpenChange={(open) => !open && setSelectedAssociation(null)}
        association={selectedAssociation}
        onConfirm={handleConfirmEndAssociation}
        isLoading={isEndingAssociation}
      />
    </div>
  );
};

export default AssociationsList;
