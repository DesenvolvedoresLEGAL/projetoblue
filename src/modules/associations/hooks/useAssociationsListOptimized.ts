import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { associationsOptimizedService } from '../services/associationsOptimizedService';
import { 
  AssociationGroup, 
  FilterOptions, 
  SearchOptions, 
  PaginationOptions 
} from '../types/associationsList';
import { groupAssociationsByClient } from '../utils/associationsUtils';

// Hook de debounce otimizado
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

export const useAssociationsListOptimized = () => {
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

  // Debounce search query para evitar chamadas excessivas
  const debouncedSearchQuery = useDebounce(search.query, 300);

  // Criar objeto de busca com query debounced
  const debouncedSearch = useMemo(() => ({
    ...search,
    query: debouncedSearchQuery
  }), [search.searchType, debouncedSearchQuery]);

  // Query otimizada para associações com cache inteligente
  const {
    data: associationsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['associations-optimized', filters, debouncedSearch, pagination.page],
    queryFn: () => associationsOptimizedService.getAssociationsWithDetails(filters, debouncedSearch, pagination),
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false,
    // Otimização: keep previous data durante refetch
    placeholderData: (previousData) => previousData,
  });

  // Query para opções de filtro com cache longo
  const { data: filterOptions } = useQuery({
    queryKey: ['associations-filter-options-optimized'],
    queryFn: associationsOptimizedService.getFilterOptions,
    staleTime: 1000 * 60 * 30, // 30 minutos
    gcTime: 1000 * 60 * 60, // 1 hora
  });

  // Processar associações - agora muito mais simples pois filtering já foi feito
  const processedAssociations = useMemo(() => {
    return associationsData?.data || [];
  }, [associationsData?.data]);

  // Agrupar associações por cliente
  const associationGroups: AssociationGroup[] = useMemo(() => {
    if (!processedAssociations.length) return [];
    
    const grouped = groupAssociationsByClient(processedAssociations);
    
    return grouped.map(group => ({
      ...group,
      is_expanded: expandedGroups.has(group.client_id)
    }));
  }, [processedAssociations, expandedGroups]);

  // Atualizar total de paginação quando dados mudarem
  useEffect(() => {
    if (associationsData?.total !== undefined) {
      setPagination(prev => ({
        ...prev,
        total: associationsData.total
      }));
    }
  }, [associationsData?.total]);

  // Handlers otimizados
  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset para primeira página
  }, []);

  const updateSearch = useCallback((newSearch: Partial<SearchOptions>) => {
    setSearch(prev => ({ ...prev, ...newSearch }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset para primeira página
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
      await associationsOptimizedService.finalizeAssociation(associationId);
      
      toast({
        description: "A associação foi finalizada com sucesso.",
      });
      
      // Refresh data
      refetch();
    } catch (error) {
      console.error('Erro ao finalizar associação:', error);
      toast({
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
