
import { AssociationWithRelations } from '../types/associationsTypes';

/**
 * Formata ICCID para exibição: **** + últimos 6 dígitos
 */
export const formatICCID = (iccid?: string): string => {
  if (!iccid) return 'N/A';
  const cleaned = iccid.replace(/\D/g, '');
  if (cleaned.length >= 6) {
    return `****${cleaned.slice(-6)}`;
  }
  return iccid;
};

/**
 * Formata número de telefone
 */
export const formatPhone = (phone: string | number): string => {
  const phoneStr = phone.toString();
  const cleaned = phoneStr.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phoneStr;
};

/**
 * Verifica se um manufacturer é operadora (notes="OPERADORA")
 */
export const isOperatorManufacturer = (manufacturer?: { notes?: string }): boolean => {
  return manufacturer?.notes === 'OPERADORA';
};

/**
 * Obtém informação de equipamento para exibição
 */
export const getEquipmentInfo = (association: AssociationWithRelations): string => {
  if (!association.equipment) return 'N/A';
  
  // Para assets com solution_id 1,2,4 - prioridade máxima
  if (association.equipment.solution_id && [1, 2, 4].includes(association.equipment.solution_id)) {
    const equipmentInfo = association.equipment.radio || association.equipment.model || 'Equipamento';
    const chipInfo = association.chip?.iccid ? ` + Chip ${formatICCID(association.chip.iccid)}` : '';
    return `${equipmentInfo}${chipInfo}`;
  }
  
  // Para outros equipamentos, mostrar RADIO ou modelo
  return association.equipment.radio || association.equipment.model || 'Equipamento';
};

/**
 * Obtém informação de chip para exibição
 */
export const getChipInfo = (association: AssociationWithRelations): string => {
  if (!association.chip?.iccid) return 'N/A';
  return formatICCID(association.chip.iccid);
};

/**
 * Obtém informação de operadora baseada no manufacturer
 */
export const getOperatorInfo = (association: AssociationWithRelations): string => {
  const equipment = association.equipment;
  const chip = association.chip;
  
  // Verificar manufacturer do equipamento
  if (equipment?.manufacturer && isOperatorManufacturer(equipment.manufacturer)) {
    return equipment.manufacturer.name || 'Operadora';
  }
  
  // Verificar manufacturer do chip
  if (chip?.manufacturer && isOperatorManufacturer(chip.manufacturer)) {
    return chip.manufacturer.name || 'Operadora';
  }
  
  return 'N/A';
};

/**
 * Formata período da associação
 */
export const getAssociationPeriod = (association: AssociationWithRelations): string => {
  const start = new Date(association.entry_date).toLocaleDateString('pt-BR');
  if (!association.exit_date) {
    return `${start} → Ativa`;
  }
  const end = new Date(association.exit_date).toLocaleDateString('pt-BR');
  return `${start} → ${end}`;
};
