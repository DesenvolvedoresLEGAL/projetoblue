
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

// Debounce hook for search optimization
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

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

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(search.query, 300);

  // Create search object with debounced query
  const debouncedSearch = useMemo(() => ({
    ...search,
    query: debouncedSearchQuery
  }), [search.searchType, debouncedSearchQuery]);

  // Query for associations data with improved caching
  const {
    data: associationsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['associations-list', filters, debouncedSearch, pagination.page],
    queryFn: () => associationsListService.getAssociationsWithDetails(filters, debouncedSearch, pagination),
    staleTime: 1000 * 60 * 2, // 2 minutes - reduced for fresher data
    gcTime: 1000 * 60 * 10, // 10 minutes cache time
    refetchOnWindowFocus: false, // Avoid unnecessary refetches
  });

  // Query for filter options with longer cache
  const { data: filterOptions } = useQuery({
    queryKey: ['associations-filter-options'],
    queryFn: associationsListService.getFilterOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour cache time
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
      
      toast.success("A associação foi finalizada com sucesso.",
      );
      
      // Refresh data
      refetch();
    } catch (error) {
      console.error('Erro ao finalizar associação:', error);
      toast.error("Ocorreu um erro ao finalizar a associação. Tente novamente ou contate o suporte.");
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
