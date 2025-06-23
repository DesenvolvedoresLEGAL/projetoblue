
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface URLFiltersParams {
  setFilterType: (value: string) => void;
  setFilterStatus: (value: string) => void;
  setFilterManufacturer: (value: string) => void;
  filterType: string;
  filterStatus: string;
  filterManufacturer: string;
}

export const useURLFilters = ({
  setFilterType,
  setFilterStatus,
  setFilterManufacturer,
  filterType,
  filterStatus,
  filterManufacturer
}: URLFiltersParams) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Ler parâmetros da URL no carregamento inicial
  useEffect(() => {
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
  }, [searchParams, setFilterType, setFilterStatus, setFilterManufacturer, filterType, filterStatus, filterManufacturer]);

  // Função para atualizar URL quando filtros mudarem
  const updateURLParams = (newFilters: {
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
  };

  // Obter excludeSolutions da URL
  const getExcludeSolutions = (): string[] => {
    const excludeParam = searchParams.get('exclude_solutions');
    return excludeParam ? excludeParam.split(',').filter(Boolean) : [];
  };

  return {
    updateURLParams,
    excludeSolutions: getExcludeSolutions()
  };
};
