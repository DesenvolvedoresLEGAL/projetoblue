
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { associationsListService } from '../services/associationsListService';
import { 
  AssociationGroup, 
  FilterOptions, 
  SearchOptions, 
  PaginationOptions 
} from '../types/associationsList';
import { groupAssociationsByClient } from '../utils/associationsUtils';

export const useAssociationsList = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    associationType: 'all',
    assetType: 'all',
    manufacturer: 'all',
    dateRange: {
      start: null,
      end: null
    }
  });

  const [search, setSearch] = useState<SearchOptions>({
    query: '',
    searchType: 'all'
  });

  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: 11,
    total: 0
  });

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Query for associations data
  const {
    data: associationsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['associations-list', filters, search, pagination.page],
    queryFn: () => associationsListService.getAssociationsWithDetails(filters, search, pagination),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query for filter options
  const { data: filterOptions } = useQuery({
    queryKey: ['associations-filter-options'],
    queryFn: associationsListService.getFilterOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Group associations by client
  const associationGroups: AssociationGroup[] = useMemo(() => {
    if (!associationsData?.data) return [];
    
    const grouped = groupAssociationsByClient(associationsData.data);
    
    return grouped.map(group => ({
      ...group,
      is_expanded: expandedGroups.has(group.client_id)
    }));
  }, [associationsData?.data, expandedGroups]);

  // Update pagination total when data changes
  useEffect(() => {
    if (associationsData?.total !== undefined) {
      setPagination(prev => ({
        ...prev,
        total: associationsData.total
      }));
    }
  }, [associationsData?.total]);

  // Handlers
  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updateSearch = useCallback((newSearch: Partial<SearchOptions>) => {
    setSearch(prev => ({ ...prev, ...newSearch }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updatePagination = useCallback((newPagination: Partial<PaginationOptions>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const toggleGroupExpansion = useCallback((clientId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  }, []);

  const finalizeAssociation = useCallback(async (associationId: string) => {
    try {
      await associationsListService.finalizeAssociation(associationId);
      
      toast.success(
        "Associação finalizada\n A associação foi finalizada com sucesso.",
      );
      
      // Refresh data
      refetch();
    } catch (error) {
      console.error('Erro ao finalizar associação:', error);
      toast.error(
        "Ocorreu um erro ao finalizar a associação.\nTente novamente ou contate o suporte.",
      );
    }
  }, [refetch]);

  return {
    associationGroups,
    isLoading,
    error,
    filters,
    search,
    pagination,
    filterOptions: filterOptions || { associationTypes: [], operators: [] },
    updateFilters,
    updateSearch,
    updatePagination,
    finalizeAssociation,
    toggleGroupExpansion
  };
};
