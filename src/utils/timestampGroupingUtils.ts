
import { Association } from '@/types/associations';

export interface TimestampGroup {
  timestamp: string; // YYYY-MM-DD HH:mm
  associations: Association[];
}

/**
 * Trunca um timestamp para o minuto exato (YYYY-MM-DD HH:mm)
 * Ignora segundos e milissegundos
 */
export const truncateToMinute = (timestamp: string): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * Agrupa associações por timestamp de minuto (YYYY-MM-DD HH:mm)
 */
export const groupAssociationsByTimestamp = (associations: Association[]): TimestampGroup[] => {
  const groups: { [key: string]: Association[] } = {};
  
  // Agrupar por timestamp truncado
  associations.forEach(association => {
    const timestampKey = truncateToMinute(association.created_at);
    
    if (!groups[timestampKey]) {
      groups[timestampKey] = [];
    }
    
    groups[timestampKey].push(association);
  });
  
  // Converter para array e ordenar por timestamp (mais recentes primeiro)
  const timestampGroups: TimestampGroup[] = Object.entries(groups)
    .map(([timestamp, associations]) => ({
      timestamp,
      associations
    }))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  
  return timestampGroups;
};

/**
 * Conta o total de associações e grupos
 */
export const getTimestampGroupStats = (groups: TimestampGroup[]) => {
  const totalAssociations = groups.reduce((sum, group) => sum + group.associations.length, 0);
  const totalGroups = groups.length;
  
  return {
    totalAssociations,
    totalGroups
  };
};
