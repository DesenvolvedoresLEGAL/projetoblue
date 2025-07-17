
import { useState, useMemo } from 'react';
import { AssociationFilters, FilterOption, AssociationType } from '../types/filterTypes';
import { ClientAssociationGroup } from '../types/associationsTypes';

interface UseAssociationFiltersProps {
  clientGroups: ClientAssociationGroup[];
  associationTypes?: AssociationType[];
}

export const useAssociationFilters = ({ 
  clientGroups, 
  associationTypes = [] 
}: UseAssociationFiltersProps) => {
  const [filters, setFilters] = useState<AssociationFilters>({
    status: 'all',
    associationType: 'all'
  });

  // Aplicar filtros aos grupos de clientes
  const filteredGroups = useMemo(() => {
    return clientGroups.map(group => {
      // Filtrar associações dentro de cada grupo
      const filteredAssociations = group.associations.filter(association => {
        // Filtro de status
        if (filters.status === 'active' && !association.status) return false;
        if (filters.status === 'inactive' && association.status) return false;

        // Filtro de tipo de associação
        if (filters.associationType !== 'all' && 
            association.association_type_id !== filters.associationType) return false;

        return true;
      });

      // Se não há associações após filtro, não incluir o grupo
      if (filteredAssociations.length === 0) return null;

      // Recalcular estatísticas do grupo baseado nas associações filtradas
      const activeAssociations = filteredAssociations.filter(a => a.status).length;
      const inactiveAssociations = filteredAssociations.filter(a => !a.status).length;
      
      let principalChips = 0;
      let backupChips = 0;
      let equipmentOnly = 0;

      filteredAssociations.forEach(association => {
        if (association.status) { // Só contar associações ativas para tipos
          switch (association.chipType) {
            case 'principal':
              principalChips++;
              break;
            case 'backup':
              backupChips++;
              break;
            case 'none':
              if (association.equipment_id) {
                equipmentOnly++;
              }
              break;
          }
        }
      });

      return {
        ...group,
        associations: filteredAssociations,
        totalAssociations: filteredAssociations.length,
        activeAssociations,
        inactiveAssociations,
        principalChips,
        backupChips,
        equipmentOnly
      };
    }).filter(Boolean) as ClientAssociationGroup[];
  }, [clientGroups, filters]);

  // Opções para filtro de status com contadores
  const statusOptions = useMemo((): FilterOption[] => {
    const totalGroups = clientGroups.length;
    const activeGroups = clientGroups.filter(g => g.activeAssociations > 0).length;
    const inactiveGroups = clientGroups.filter(g => g.inactiveAssociations > 0).length;

    return [
      { value: 'all', label: 'Todos', count: totalGroups },
      { value: 'active', label: 'Ativo', count: activeGroups },
      { value: 'inactive', label: 'Inativo', count: inactiveGroups }
    ];
  }, [clientGroups]);

  // Opções para filtro de tipo de associação com contadores
  const associationTypeOptions = useMemo((): FilterOption[] => {
    const options: FilterOption[] = [
      { value: 'all', label: 'Todos', count: clientGroups.length }
    ];

    associationTypes.forEach(type => {
      const count = clientGroups.filter(group => 
        group.associations.some(a => a.association_type_id === type.id)
      ).length;

      if (count > 0) {
        options.push({
          value: type.id,
          label: type.type,
          count
        });
      }
    });

    return options;
  }, [clientGroups, associationTypes]);

  const updateFilter = (key: keyof AssociationFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      associationType: 'all'
    });
  };

  const hasActiveFilters = filters.status !== 'all' || filters.associationType !== 'all';

  return {
    filters,
    filteredGroups,
    statusOptions,
    associationTypeOptions,
    updateFilter,
    clearFilters,
    hasActiveFilters
  };
};
