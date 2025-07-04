
import { SolutionType } from '@/types/asset';

/**
 * Maps solution ID and name to proper SolutionType
 */
export function mapSolutionToType(solutionId: number, solutionName?: string): SolutionType {
  if (solutionId === 11 || solutionName === 'CHIP') {
    return 'CHIP';
  }
  return 'EQUIPMENT';
}

/**
 * Safely converts string to number, returning null if invalid
 */
export function safeParseNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;

  if (value.toString().length > 11) return null;
  
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? null : num;
}

/**
 * Maps status name to status ID
 */
export function mapStatusNameToId(statusName: string): number | null {
  const statusMap: Record<string, number> = {
    'DISPONÍVEL': 1,
    'EM LOCAÇÃO': 2,
    'EM ASSINATURA': 3,
    'SEM DADOS': 4,
    'BLOQUEADO': 5,
    'EM MANUTENÇÃO': 6
  };
  
  return statusMap[statusName.toUpperCase()] || null;
}

/**
 * Validates if a filter value is valid (not empty, not "all", not NaN)
 */
export function isValidFilterValue(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined || value === '' || value === 'all') {
    return false;
  }
  
  if (typeof value === 'string' && value.toLowerCase() === 'nan') {
    return false;
  }
  
  if (typeof value === 'number' && isNaN(value)) {
    return false;
  }
  
  return true;
}
