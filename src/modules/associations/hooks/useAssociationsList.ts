
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
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes cache time
    refetchOnWindowFocus: false,
  });

  // Query for filter options with longer cache
  const { data: filterOptions } = useQuery({
    queryKey: ['associations-filter-options'],
    queryFn: associationsListService.getFilterOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour cache time
  });

  // Process associations with client-side filtering for complex filters
  const processedAssociations = useMemo(() => {
    if (!associationsData?.data) return [];
    
    let filteredData = associationsData.data;

    // Apply complex filters that couldn't be done at database level
    
    // Filter by asset type (priority vs others)
    if (filters.assetType === 'priority') {
      filteredData = filteredData.filter(item => 
        item.equipment_solution_id && [1, 2, 4].includes(item.equipment_solution_id)
      );
    } else if (filters.assetType === 'others') {
      filteredData = filteredData.filter(item => 
        !item.equipment_solution_id || ![1, 2, 4].includes(item.equipment_solution_id)
      );
    }

    // Filter by manufacturer (for chips only)
    if (filters.manufacturer !== 'all') {
      filteredData = filteredData.filter(item => 
        item.chip_manufacturer_id === filters.manufacturer
      );
    }

    // Apply advanced search filtering
    if (debouncedSearch.query.trim()) {
      const searchTerm = debouncedSearch.query.toLowerCase();
      
      filteredData = filteredData.filter(item => {
        const matchesClient = debouncedSearch.searchType === 'all' || debouncedSearch.searchType === 'client' 
          ? item.client_name.toLowerCase().includes(searchTerm)
          : false;
          
        const matchesICCID = debouncedSearch.searchType === 'all' || debouncedSearch.searchType === 'iccid'
          ? item.chip_iccid?.toLowerCase().includes(searchTerm) || 
            item.chip_iccid?.slice(-6).includes(searchTerm) // Corrigido de -5 para -6
          : false;
          
        const matchesRadio = debouncedSearch.searchType === 'all' || debouncedSearch.searchType === 'radio'
          ? item.equipment_radio?.toLowerCase().includes(searchTerm)
          : false;
          
        return matchesClient || matchesICCID || matchesRadio;
      });
    }

    return filteredData;
  }, [associationsData?.data, filters.assetType, filters.manufacturer, debouncedSearch]);

  // Group associations by client
  const associationGroups: AssociationGroup[] = useMemo(() => {
    if (!processedAssociations.length) return [];
    
    const grouped = groupAssociationsByClient(processedAssociations);
    
    return grouped.map(group => ({
      ...group,
      is_expanded: expandedGroups.has(group.client_id)
    }));
  }, [processedAssociations, expandedGroups]);

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
      
      toast({
        title: "Associação finalizada",
        description: "A associação foi finalizada com sucesso.",
      });
      
      // Refresh data
      refetch();
    } catch (error) {
      console.error('Erro ao finalizar associação:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao finalizar a associação. Tente novamente ou contate o suporte.",
        variant: "destructive",
      });
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
