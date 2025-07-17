
import { AssociationWithRelations, ClientAssociationGroup } from '../types/associationsTypes';
import { AssociationFilters, FilterCounts, SPEEDY_SOLUTION_IDS } from '../types/filterTypes';

export const applyFilters = (
  groups: ClientAssociationGroup[],
  filters: AssociationFilters
): ClientAssociationGroup[] => {
  return groups.filter(group => {
    // Filtrar associações do grupo baseado nos filtros
    const filteredAssociations = group.associations.filter(association => {
      // Filtro de status
      if (filters.status === 'active' && !association.status) return false;
      if (filters.status === 'inactive' && association.status) return false;

      // Filtro de tipo de associação
      if (filters.associationType !== 'all' && association.association_type_id !== filters.associationType) {
        return false;
      }

      // Filtro de tipo de ativo
      if (filters.assetType !== 'all') {
        const hasSpeedyEquipment = association.equipment?.solution_id && 
          SPEEDY_SOLUTION_IDS.includes(association.equipment.solution_id);
        
        if (filters.assetType === 'speedy' && !hasSpeedyEquipment) return false;
        if (filters.assetType === 'others' && hasSpeedyEquipment) return false;
      }

      // Filtro de fabricante/operadora
      if (filters.manufacturer !== 'all') {
        const manufacturerId = association.equipment?.manufacturer_id || association.chip?.manufacturer_id;
        if (manufacturerId !== filters.manufacturer) return false;
      }

      // Filtro de período
      if (filters.dateRange.startDate || filters.dateRange.endDate) {
        const entryDate = new Date(association.entry_date);
        
        if (filters.dateRange.startDate && entryDate < filters.dateRange.startDate) return false;
        if (filters.dateRange.endDate && entryDate > filters.dateRange.endDate) return false;
      }

      return true;
    });

    // Só manter grupos que tenham pelo menos uma associação após filtros
    return filteredAssociations.length > 0;
  }).map(group => ({
    ...group,
    associations: group.associations.filter(association => {
      // Aplicar os mesmos filtros nas associações do grupo
      if (filters.status === 'active' && !association.status) return false;
      if (filters.status === 'inactive' && association.status) return false;
      if (filters.associationType !== 'all' && association.association_type_id !== filters.associationType) return false;
      
      if (filters.assetType !== 'all') {
        const hasSpeedyEquipment = association.equipment?.solution_id && 
          SPEEDY_SOLUTION_IDS.includes(association.equipment.solution_id);
        if (filters.assetType === 'speedy' && !hasSpeedyEquipment) return false;
        if (filters.assetType === 'others' && hasSpeedyEquipment) return false;
      }
      
      if (filters.manufacturer !== 'all') {
        const manufacturerId = association.equipment?.manufacturer_id || association.chip?.manufacturer_id;
        if (manufacturerId !== filters.manufacturer) return false;
      }
      
      if (filters.dateRange.startDate || filters.dateRange.endDate) {
        const entryDate = new Date(association.entry_date);
        if (filters.dateRange.startDate && entryDate < filters.dateRange.startDate) return false;
        if (filters.dateRange.endDate && entryDate > filters.dateRange.endDate) return false;
      }
      
      return true;
    })
  }));
};

export const calculateFilterCounts = (
  groups: ClientAssociationGroup[],
  filters: AssociationFilters
): FilterCounts => {
  const allAssociations = groups.flatMap(group => group.associations);
  
  const counts: FilterCounts = {
    total: allAssociations.length,
    active: 0,
    inactive: 0,
    byAssociationType: {},
    byAssetType: { speedy: 0, others: 0 },
    byManufacturer: {}
  };

  allAssociations.forEach(association => {
    // Contar status
    if (association.status) {
      counts.active++;
    } else {
      counts.inactive++;
    }

    // Contar tipos de associação
    const typeId = association.association_type_id;
    counts.byAssociationType[typeId] = (counts.byAssociationType[typeId] || 0) + 1;

    // Contar tipos de ativo
    const hasSpeedyEquipment = association.equipment?.solution_id && 
      SPEEDY_SOLUTION_IDS.includes(association.equipment.solution_id);
    
    if (hasSpeedyEquipment) {
      counts.byAssetType.speedy++;
    } else {
      counts.byAssetType.others++;
    }

    // Contar fabricantes
    const manufacturerId = association.equipment?.manufacturer_id || association.chip?.manufacturer_id;
    if (manufacturerId) {
      counts.byManufacturer[manufacturerId] = (counts.byManufacturer[manufacturerId] || 0) + 1;
    }
  });

  return counts;
};

export const getAvailableOptions = (
  groups: ClientAssociationGroup[],
  currentFilters: AssociationFilters,
  filterType: keyof AssociationFilters
) => {
  // Para filtros em cascata, aplicar filtros anteriores
  const cascadeFilters: Partial<AssociationFilters> = { ...currentFilters };
  
  // Remover o filtro atual para calcular opções disponíveis
  delete cascadeFilters[filterType];
  
  const filteredGroups = applyFilters(groups, cascadeFilters as AssociationFilters);
  const allAssociations = filteredGroups.flatMap(group => group.associations);
  
  return allAssociations;
};

export const resetDependentFilters = (
  filters: AssociationFilters,
  changedFilter: keyof AssociationFilters
): AssociationFilters => {
  const newFilters = { ...filters };

  switch (changedFilter) {
    case 'status':
      // Status não afeta outros filtros diretamente
      break;
      
    case 'associationType':
      // Tipo de associação não afeta outros filtros diretamente
      break;
      
    case 'assetType':
      // Mudança no tipo de ativo pode afetar fabricantes disponíveis
      newFilters.manufacturer = 'all';
      break;
      
    case 'manufacturer':
      // Fabricante é o último na cascata
      break;
      
    case 'dateRange':
      // Período não afeta outros filtros
      break;
  }

  return newFilters;
};

export const formatDateForFilter = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const parseDateFromFilter = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00.000Z');
};
