
import { useState, useMemo, useCallback } from 'react';
import { ClientAssociationGroup } from '../types/associationsTypes';
import { AssociationFilters, DEFAULT_FILTERS, FilterCounts } from '../types/filterTypes';
import { applyFilters, calculateFilterCounts, resetDependentFilters } from '../utils/filterUtils';

interface UseAssociationFiltersProps {
  clientGroups: ClientAssociationGroup[];
}

export const useAssociationFilters = ({ clientGroups }: UseAssociationFiltersProps) => {
  const [filters, setFilters] = useState<AssociationFilters>(DEFAULT_FILTERS);

  // Aplicar filtros aos grupos
  const filteredGroups = useMemo(() => {
    return applyFilters(clientGroups, filters);
  }, [clientGroups, filters]);

  // Calcular contadores para os filtros
  const filterCounts = useMemo(() => {
    return calculateFilterCounts(clientGroups, filters);
  }, [clientGroups, filters]);

  // Atualizar filtro individual
  const updateFilter = useCallback(<K extends keyof AssociationFilters>(
    key: K,
    value: AssociationFilters[K]
  ) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, [key]: value };
      // Resetar filtros dependentes se necessário
      return resetDependentFilters(newFilters, key);
    });
  }, []);

  // Resetar todos os filtros
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Verificar se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'dateRange') {
        return Boolean(value.startDate || value.endDate);
      }
      return value !== 'all';
    });
  }, [filters]);

  // Obter contadores para opções específicas
  const getFilterOptionCount = useCallback((
    filterType: keyof AssociationFilters,
    optionValue: string | number
  ): number => {
    switch (filterType) {
      case 'status':
        if (optionValue === 'active') return filterCounts.active;
        if (optionValue === 'inactive') return filterCounts.inactive;
        return filterCounts.total;
        
      case 'associationType':
        if (optionValue === 'all') return filterCounts.total;
        return filterCounts.byAssociationType[optionValue as number] || 0;
        
      case 'assetType':
        if (optionValue === 'speedy') return filterCounts.byAssetType.speedy;
        if (optionValue === 'others') return filterCounts.byAssetType.others;
        return filterCounts.total;
        
      case 'manufacturer':
        if (optionValue === 'all') return filterCounts.total;
        return filterCounts.byManufacturer[optionValue as number] || 0;
        
      default:
        return 0;
    }
  }, [filterCounts]);

  return {
    filters,
    filteredGroups,
    filterCounts,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    getFilterOptionCount
  };
};
