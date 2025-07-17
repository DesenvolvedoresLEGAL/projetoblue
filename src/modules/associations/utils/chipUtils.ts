
import { AssociationWithRelations } from '../types/associationsTypes';

export type ChipType = 'principal' | 'backup' | 'none';

/**
 * Determina o tipo de chip baseado na associação
 */
export const getChipType = (association: AssociationWithRelations): ChipType => {
  // Se não tem chip, retorna 'none'
  if (!association.chip_id) {
    return 'none';
  }

  // Se tem chip e equipamento com solution_id 1, 2 ou 4, é principal
  if (association.equipment?.solution_id && [1, 2, 4].includes(association.equipment.solution_id)) {
    return 'principal';
  }

  // Se tem apenas chip (sem equipamento), é backup
  return 'backup';
};

/**
 * Retorna o label para exibição do tipo de chip
 */
export const getChipTypeLabel = (chipType: ChipType): string => {
  switch (chipType) {
    case 'principal':
      return 'Chip + SPEEDY';
    case 'backup':
      return 'Chip Backup';
    case 'none':
      return '';
    default:
      return '';
  }
};

/**
 * Retorna a cor/variante para o badge do tipo de chip
 */
export const getChipTypeVariant = (chipType: ChipType): 'default' | 'secondary' => {
  switch (chipType) {
    case 'principal':
      return 'default';
    case 'backup':
      return 'secondary';
    default:
      return 'secondary';
  }
};
