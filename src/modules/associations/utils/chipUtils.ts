
import { AssociationWithRelations } from '../types/associationsTypes';

export type ChipType = 'principal' | 'backup' | 'none';

/**
 * Determina o tipo de chip baseado nos IDs da associação
 */
export const getChipType = (association: AssociationWithRelations): ChipType => {
  const hasEquipment = Boolean(association.equipment_id);
  const hasChip = Boolean(association.chip_id);
  
  if (hasEquipment && hasChip) {
    return 'principal';
  } else if (hasChip && !hasEquipment) {
    return 'backup';
  }
  
  return 'none';
};

/**
 * Verifica se a associação tem um chip (principal ou backup)
 */
export const hasChip = (association: AssociationWithRelations): boolean => {
  return Boolean(association.chip_id);
};

/**
 * Verifica se a associação tem equipamento
 */
export const hasEquipment = (association: AssociationWithRelations): boolean => {
  return Boolean(association.equipment_id);
};

/**
 * Retorna a descrição textual do tipo de chip
 */
export const getChipTypeLabel = (chipType: ChipType): string => {
  switch (chipType) {
    case 'principal':
      return 'Chip Principal';
    case 'backup':
      return 'Chip Backup';
    case 'none':
      return 'Sem Chip';
    default:
      return 'Desconhecido';
  }
};
