
import { AssociationWithRelations } from '../types/associationsTypes';

/**
 * Obtém prioridade de um asset baseado no solution_id
 */
const getAssetPriority = (solutionId?: number): number => {
  if (!solutionId) return 3; // Baixa prioridade para assets sem solution_id
  
  // Prioridade máxima para solution_id 1,2,4
  if ([1, 2, 4].includes(solutionId)) return 0;
  
  // Chips (solution_id 11) têm prioridade mais baixa
  if (solutionId === 11) return 4;
  
  // Demais equipamentos
  return 2;
};

/**
 * Sorteia associações seguindo a lógica de priorização:
 * 1. Status (ativas primeiro)
 * 2. Assets com solution_id 1,2,4 (prioridade máxima)
 * 3. Demais equipamentos
 * 4. Chips por último
 */
export const sortAssociations = (associations: AssociationWithRelations[]): AssociationWithRelations[] => {
  return [...associations].sort((a, b) => {
    // 1. Status primeiro (ativas antes de inativas)
    if (a.status !== b.status) {
      return a.status ? -1 : 1; // true (ativa) vem antes de false (inativa)
    }
    
    // 2. Prioridade por solution_id
    const priorityA = Math.min(
      getAssetPriority(a.equipment?.solution_id),
      getAssetPriority(a.chip?.solution_id)
    );
    const priorityB = Math.min(
      getAssetPriority(b.equipment?.solution_id),
      getAssetPriority(b.chip?.solution_id)
    );
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // 3. Ordenação secundária por data de entrada (mais recente primeiro)
    return new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime();
  });
};

/**
 * Agrupa associações por status
 */
export const groupAssociationsByStatus = (associations: AssociationWithRelations[]) => {
  const active = associations.filter(assoc => assoc.status);
  const inactive = associations.filter(assoc => !assoc.status);
  
  return {
    active: sortAssociations(active),
    inactive: sortAssociations(inactive),
    totalActive: active.length,
    totalInactive: inactive.length
  };
};
