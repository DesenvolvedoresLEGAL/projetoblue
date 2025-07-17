
import { useState, useMemo } from 'react';
import { AssociationFilters, FilterOption, AssociationType, AssetTypeOption, ManufacturerOption } from '../types/filterTypes';
import { ClientAssociationGroup } from '../types/associationsTypes';

interface UseAssociationFiltersProps {
  clientGroups: ClientAssociationGroup[];
  associationTypes?: AssociationType[];
}

// Definir os tipos de ativo
const ASSET_TYPE_OPTIONS: AssetTypeOption[] = [
  { value: 'all', label: 'Todos', solutionIds: [] },
  { value: 'chips_speedy', label: 'Chips + SPEEDY', solutionIds: [11] }, // Chips com SPEEDY
  { value: 'chips', label: 'Chips', solutionIds: [11] }, // Apenas chips
  { value: 'equipment', label: 'Equipamentos', solutionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12] } // Excluir chips (solution_id = 11)
];

export const useAssociationFilters = ({ 
  clientGroups, 
  associationTypes = [] 
}: UseAssociationFiltersProps) => {
  const [filters, setFilters] = useState<AssociationFilters>({
    status: 'all',
    associationType: 'all',
    assetType: 'all',
    manufacturer: 'all'
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

        // Filtro de tipo de ativo
        if (filters.assetType !== 'all') {
          const hasChip = association.chip_id !== null;
          const hasEquipment = association.equipment_id !== null;
          const chipSolution = association.chip?.solution_id;
          const equipmentSolution = association.equipment?.solution_id;

          switch (filters.assetType) {
            case 'chips_speedy':
              // Chips com SPEEDY (chip + equipment onde equipment é SPEEDY)
              if (!hasChip || !hasEquipment) return false;
              if (chipSolution !== 11) return false; // Chip deve ser solution_id = 11
              if (![1, 2, 4].includes(equipmentSolution || 0)) return false; // Equipment deve ser SPEEDY
              break;
            case 'chips':
              // Apenas chips (sem equipamentos ou com equipamentos não-SPEEDY)
              if (!hasChip) return false;
              if (chipSolution !== 11) return false;
              if (hasEquipment && [1, 2, 4].includes(equipmentSolution || 0)) return false; // Não pode ter SPEEDY
              break;
            case 'equipment':
              // Apenas equipamentos (sem chips)
              if (!hasEquipment || hasChip) return false;
              break;
          }
        }

        // Filtro de fabricante/operadora
        if (filters.manufacturer !== 'all') {
          const equipmentManufacturer = association.equipment?.manufacturer?.name;
          const chipManufacturer = association.chip?.manufacturer?.name;
          const equipmentIsOperadora = association.equipment?.manufacturer?.description === 'Operadora';
          const chipIsOperadora = association.chip?.manufacturer?.description === 'Operadora';
          
          // Se é uma operadora
          if (filters.manufacturer === 'operadora') {
            if (!equipmentIsOperadora && !chipIsOperadora) return false;
          } else {
            // Se é um fabricante específico
            if (equipmentManufacturer !== filters.manufacturer && chipManufacturer !== filters.manufacturer) return false;
          }
        }

        // Filtro de período (entry_date)
        if (filters.entryDateFrom) {
          const entryDate = new Date(association.entry_date);
          if (entryDate < filters.entryDateFrom) return false;
        }

        if (filters.entryDateTo) {
          const entryDate = new Date(association.entry_date);
          if (entryDate > filters.entryDateTo) return false;
        }

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

  // Opções para filtro de tipo de ativo
  const assetTypeOptions = useMemo((): FilterOption[] => {
    return ASSET_TYPE_OPTIONS.map(option => {
      if (option.value === 'all') {
        return { ...option, count: clientGroups.length };
      }

      const count = clientGroups.filter(group => 
        group.associations.some(association => {
          const hasChip = association.chip_id !== null;
          const hasEquipment = association.equipment_id !== null;
          const chipSolution = association.chip?.solution_id;
          const equipmentSolution = association.equipment?.solution_id;

          switch (option.value) {
            case 'chips_speedy':
              return hasChip && hasEquipment && 
                     chipSolution === 11 && 
                     [1, 2, 4].includes(equipmentSolution || 0);
            case 'chips':
              return hasChip && chipSolution === 11 && 
                     (!hasEquipment || ![1, 2, 4].includes(equipmentSolution || 0));
            case 'equipment':
              return hasEquipment && !hasChip;
            default:
              return false;
          }
        })
      ).length;

      return { ...option, count };
    });
  }, [clientGroups]);

  // Opções para filtro de fabricante/operadora
  const manufacturerOptions = useMemo((): FilterOption[] => {
    const options: FilterOption[] = [
      { value: 'all', label: 'Todos', count: clientGroups.length }
    ];

    // Adicionar operadoras (baseado em manufacturer?.description === 'Operadora')
    const operatorCount = clientGroups.filter(group =>
      group.associations.some(a => 
        a.equipment?.manufacturer?.description === 'Operadora' ||
        a.chip?.manufacturer?.description === 'Operadora'
      )
    ).length;

    if (operatorCount > 0) {
      options.push({
        value: 'operadora',
        label: 'Operadoras',
        count: operatorCount
      });
    }

    // Adicionar fabricantes únicos
    const manufacturers = new Map<string, number>();
    
    clientGroups.forEach(group => {
      group.associations.forEach(association => {
        // Verificar fabricante do equipamento
        const equipmentManufacturer = association.equipment?.manufacturer?.name;
        if (equipmentManufacturer && association.equipment?.manufacturer?.description !== 'Operadora') {
          const currentCount = manufacturers.get(equipmentManufacturer) || 0;
          manufacturers.set(equipmentManufacturer, currentCount + 1);
        }

        // Verificar fabricante do chip
        const chipManufacturer = association.chip?.manufacturer?.name;
        if (chipManufacturer && association.chip?.manufacturer?.description !== 'Operadora') {
          const currentCount = manufacturers.get(chipManufacturer) || 0;
          manufacturers.set(chipManufacturer, currentCount + 1);
        }
      });
    });

    // Contar grupos que têm associações com cada fabricante
    manufacturers.forEach((_, manufacturer) => {
      const count = clientGroups.filter(group =>
        group.associations.some(association =>
          (association.equipment?.manufacturer?.name === manufacturer && 
           association.equipment?.manufacturer?.description !== 'Operadora') ||
          (association.chip?.manufacturer?.name === manufacturer && 
           association.chip?.manufacturer?.description !== 'Operadora')
        )
      ).length;

      if (count > 0) {
        options.push({
          value: manufacturer,
          label: manufacturer,
          count
        });
      }
    });

    return options;
  }, [clientGroups]);

  const updateFilter = (key: keyof AssociationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      associationType: 'all',
      assetType: 'all',
      manufacturer: 'all'
    });
  };

  const hasActiveFilters = filters.status !== 'all' || 
                         filters.associationType !== 'all' ||
                         filters.assetType !== 'all' ||
                         filters.manufacturer !== 'all' ||
                         filters.entryDateFrom ||
                         filters.entryDateTo;

  return {
    filters,
    filteredGroups,
    statusOptions,
    associationTypeOptions,
    assetTypeOptions,
    manufacturerOptions,
    updateFilter,
    clearFilters,
    hasActiveFilters
  };
};
