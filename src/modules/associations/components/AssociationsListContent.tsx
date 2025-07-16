
import React from 'react';
import { useAssociationsList } from '../hooks/useAssociationsList';
import { AssociationFilters } from './association/AssociationFilters';
import { AssociationSearch } from './association/AssociationSearch';
import { AssociationTable } from './association/AssociationTable';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

export const AssociationsListContent: React.FC = () => {
  const {
    associationGroups,
    isLoading,
    error,
    filters,
    search,
    pagination,
    filterOptions,
    updateFilters,
    updateSearch,
    updatePagination,
    finalizeAssociation,
    toggleGroupExpansion
  } = useAssociationsList();

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar associações</h3>
          <p className="text-muted-foreground">
            Ocorreu um erro ao buscar os dados. Tente novamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <AssociationFilters
        filters={filters}
        filterOptions={filterOptions}
        onFiltersChange={updateFilters}
      />
      
      {/* Search */}
      <AssociationSearch
        search={search}
        onSearchChange={updateSearch}
      />
      
      {/* Results */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <AssociationTable
          associationGroups={associationGroups}
          pagination={pagination}
          onPaginationChange={updatePagination}
          onFinalizeAssociation={finalizeAssociation}
          onToggleGroupExpansion={toggleGroupExpansion}
        />
      )}
    </div>
  );
};
