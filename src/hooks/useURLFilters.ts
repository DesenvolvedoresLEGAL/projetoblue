
import { useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

interface URLFiltersParams {
  setFilterType: (value: string) => void;
  setFilterStatus: (value: string) => void;
  setFilterManufacturer: (value: string) => void;
  filterType: string;
  filterStatus: string;
  filterManufacturer: string;
}

interface UseURLFiltersOptions {
  clearOnMount?: boolean;
}

export const useURLFilters = (
  {
    setFilterType,
    setFilterStatus,
    setFilterManufacturer,
    filterType,
    filterStatus,
    filterManufacturer
  }: URLFiltersParams,
  options: UseURLFiltersOptions = {}
) => {
  const { clearOnMount = true } = options;
  const [searchParams, setSearchParams] = useSearchParams();
  const hasClearedRef = useRef(false);

  // Limpar parâmetros da URL na montagem se clearOnMount for true
  useEffect(() => {
    if (clearOnMount && !hasClearedRef.current) {
      const hasFilterParams = searchParams.has('solution') ||
                             searchParams.has('type') ||
                             searchParams.has('status') ||
                             searchParams.has('manufacturer') ||
                             searchParams.has('exclude_solutions');

      if (hasFilterParams) {
        console.log('🧹 Clearing URL filter parameters on mount');
        const newParams = new URLSearchParams();
        // Manter apenas parâmetros que não são de filtro (se houver)
        for (const [key, value] of searchParams.entries()) {
          if (!['solution', 'type', 'status', 'manufacturer', 'exclude_solutions'].includes(key)) {
            newParams.set(key, value);
          }
        }
        setSearchParams(newParams, { replace: true });
      }
      hasClearedRef.current = true;
    }
  }, [clearOnMount, searchParams, setSearchParams]);

  // Ler parâmetros da URL no carregamento inicial (apenas se clearOnMount for false)
  useEffect(() => {
    if (!clearOnMount) {
      const solution = searchParams.get('solution');
      const type = searchParams.get('type');
      const status = searchParams.get('status');
      const manufacturer = searchParams.get('manufacturer');

      // Aplicar solution ou type (aliases)
      if (solution && solution !== filterType) {
        setFilterType(solution);
      } else if (type && type !== filterType) {
        setFilterType(type);
      }

      // Aplicar status
      if (status && status !== filterStatus) {
        setFilterStatus(status);
      }

      // Aplicar manufacturer
      if (manufacturer && manufacturer !== filterManufacturer) {
        setFilterManufacturer(manufacturer);
      }
    }
  }, [clearOnMount, searchParams, setFilterType, setFilterStatus, setFilterManufacturer, filterType, filterStatus, filterManufacturer]);

  // Função para atualizar URL quando filtros mudarem
  const updateURLParams = useCallback((newFilters: {
    type?: string;
    status?: string;
    manufacturer?: string;
  }) => {
    const params = new URLSearchParams(searchParams);
    
    // Atualizar parâmetros
    if (newFilters.type !== undefined) {
      if (newFilters.type === 'all') {
        params.delete('solution');
        params.delete('type');
      } else {
        params.set('solution', newFilters.type);
        params.delete('type'); // Usar solution como padrão
      }
    }

    if (newFilters.status !== undefined) {
      if (newFilters.status === 'all') {
        params.delete('status');
      } else {
        params.set('status', newFilters.status);
      }
    }

    if (newFilters.manufacturer !== undefined) {
      if (newFilters.manufacturer === 'all') {
        params.delete('manufacturer');
      } else {
        params.set('manufacturer', newFilters.manufacturer);
      }
    }

    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Função para limpar todos os parâmetros de filtro da URL
  const clearAllURLParams = useCallback(() => {
    console.log('🧹 Clearing all URL filter parameters');
    const currentParams = new URLSearchParams(window.location.search);
    const params = new URLSearchParams();
    // Manter apenas parâmetros que não são de filtro
    for (const [key, value] of currentParams.entries()) {
      if (!['solution', 'type', 'status', 'manufacturer', 'exclude_solutions'].includes(key)) {
        params.set(key, value);
      }
    }
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Obter excludeSolutions da URL
  const getExcludeSolutions = (): string[] => {
    const excludeParam = searchParams.get('exclude_solutions');
    return excludeParam ? excludeParam.split(',').filter(Boolean) : [];
  };

  return {
    updateURLParams,
    clearAllURLParams,
    excludeSolutions: getExcludeSolutions()
  };
};
