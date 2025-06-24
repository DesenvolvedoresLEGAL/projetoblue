import { useState, useEffect } from 'react';

export interface InventoryFiltersState {
  searchTerm: string;
  filterType: string;
  filterStatus: string;
  filterManufacturer: string;
}

const STORAGE_KEY = 'inventory-filters';

export const useInventoryFiltersState = () => {
  const [state, setState] = useState<InventoryFiltersState>(() => {
    if (typeof window === 'undefined') {
      return {
        searchTerm: '',
        filterType: 'all',
        filterStatus: 'all',
        filterManufacturer: 'all'
      };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          searchTerm: '',
          filterType: 'all',
          filterStatus: 'all',
          filterManufacturer: 'all',
          ...parsed
        } as InventoryFiltersState;
      }
    } catch (error) {
      console.warn('Failed to load inventory filters from localStorage:', error);
    }
    return {
      searchTerm: '',
      filterType: 'all',
      filterStatus: 'all',
      filterManufacturer: 'all'
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save inventory filters to localStorage:', error);
    }
  }, [state]);

  const setSearchTerm = (term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  };

  const setFilterType = (value: string) => {
    setState(prev => ({ ...prev, filterType: value }));
  };

  const setFilterStatus = (value: string) => {
    setState(prev => ({ ...prev, filterStatus: value }));
  };

  const setFilterManufacturer = (value: string) => {
    setState(prev => ({ ...prev, filterManufacturer: value }));
  };

  const resetFilters = () => {
    setState({
      searchTerm: '',
      filterType: 'all',
      filterStatus: 'all',
      filterManufacturer: 'all'
    });
  };

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
