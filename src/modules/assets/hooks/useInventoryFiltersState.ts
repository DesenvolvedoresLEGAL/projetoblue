
import { useState, useEffect, useCallback } from 'react';

export interface InventoryFiltersState {
  searchTerm: string;
  filterType: string;
  filterStatus: string;
  filterManufacturer: string;
}

const STORAGE_KEY = 'inventory-filters';

interface UseInventoryFiltersStateOptions {
  shouldPersist?: boolean;
  resetOnMount?: boolean;
}

export const useInventoryFiltersState = (options: UseInventoryFiltersStateOptions = {}) => {
  const { shouldPersist = false, resetOnMount = true } = options;
  
  const getDefaultState = (): InventoryFiltersState => ({
    searchTerm: '',
    filterType: 'all',
    filterStatus: 'all',
    filterManufacturer: 'all'
  });

  const [state, setState] = useState<InventoryFiltersState>(() => {
    // Se resetOnMount é true, sempre começar com estado limpo
    if (resetOnMount) {
      
      return getDefaultState();
    }

    // Só tentar carregar do localStorage se shouldPersist for true
    if (shouldPersist && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          
          return {
            ...getDefaultState(),
            ...parsed
          } as InventoryFiltersState;
        }
      } catch (error) {
      return error;
      }
    }
    
    return getDefaultState();
  });

  // Limpar localStorage existente no primeiro mount se resetOnMount for true
  useEffect(() => {
    if (resetOnMount && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        
      } catch (error) {
      return error;
      }
    }
  }, [resetOnMount]);

  // Salvar no localStorage apenas se shouldPersist for true
  useEffect(() => {
    if (shouldPersist && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        
      } catch (error) {
        return error;
      }
    }
  }, [state, shouldPersist]);

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setFilterType = useCallback((value: string) => {
    setState(prev => ({ ...prev, filterType: value }));
  }, []);

  const setFilterStatus = useCallback((value: string) => {
    setState(prev => ({ ...prev, filterStatus: value }));
  }, []);

  const setFilterManufacturer = useCallback((value: string) => {
    setState(prev => ({ ...prev, filterManufacturer: value }));
  }, []);

  const resetFilters = useCallback(() => {
    
    setState(getDefaultState());
  }, []);

  return {
    searchTerm: state.searchTerm,
    setSearchTerm,
    filterType: state.filterType,
    setFilterType,
    filterStatus: state.filterStatus,
    setFilterStatus,
    filterManufacturer: state.filterManufacturer,
    setFilterManufacturer,
    resetFilters
  };
};
