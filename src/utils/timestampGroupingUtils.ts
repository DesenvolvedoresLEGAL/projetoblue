
import { Association } from '@/types/associations';

export interface CompanyGroup {
  companyName: string;
  associations: Association[];
}

export interface TimestampGroup {
  timestamp: string; // YYYY-MM-DD HH:mm
  companyGroups: CompanyGroup[];
  totalAssociations: number;
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
 * Agrupa associações primeiro por timestamp de minuto, depois por empresa
 */
export const groupAssociationsByTimestampAndCompany = (associations: Association[]): TimestampGroup[] => {
  const timestampGroups: { [key: string]: Association[] } = {};
  
  // Primeiro agrupamento: por timestamp truncado
  associations.forEach(association => {
    const timestampKey = truncateToMinute(association.created_at);
    
    if (!timestampGroups[timestampKey]) {
      timestampGroups[timestampKey] = [];
    }
    
    timestampGroups[timestampKey].push(association);
  });
  
  // Segundo agrupamento: por empresa dentro de cada timestamp
  const finalGroups: TimestampGroup[] = Object.entries(timestampGroups)
    .map(([timestamp, associations]) => {
      const companyGroups: { [key: string]: Association[] } = {};
      
      // Agrupar por empresa
      associations.forEach(association => {
        const companyKey = association.client_name;
        
        if (!companyGroups[companyKey]) {
          companyGroups[companyKey] = [];
        }
        
        companyGroups[companyKey].push(association);
      });
      
      // Converter para array e ordenar por nome da empresa
      const companyGroupsArray: CompanyGroup[] = Object.entries(companyGroups)
        .map(([companyName, associations]) => ({
          companyName,
          associations
        }))
        .sort((a, b) => a.companyName.localeCompare(b.companyName));
      
      return {
        timestamp,
        companyGroups: companyGroupsArray,
        totalAssociations: associations.length
      };
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Mais recentes primeiro
  
  return finalGroups;
};

/**
 * Conta o total de associações e grupos
 */
export const getTimestampGroupStats = (groups: TimestampGroup[]) => {
  const totalAssociations = groups.reduce((sum, group) => sum + group.totalAssociations, 0);
  const totalTimestampGroups = groups.length;
  const totalCompanyGroups = groups.reduce((sum, group) => sum + group.companyGroups.length, 0);
  
  return {
    totalAssociations,
    totalTimestampGroups,
    totalCompanyGroups
  };
};

// Manter função original para compatibilidade
export interface TimestampGroupLegacy {
  timestamp: string; 
  associations: Association[];
}

export const groupAssociationsByTimestamp = (associations: Association[]): TimestampGroupLegacy[] => {
  const groups: { [key: string]: Association[] } = {};
  
  associations.forEach(association => {
    const timestampKey = truncateToMinute(association.created_at);
    
    if (!groups[timestampKey]) {
      groups[timestampKey] = [];
    }
    
    groups[timestampKey].push(association);
  });
  
  const timestampGroups: TimestampGroupLegacy[] = Object.entries(groups)
    .map(([timestamp, associations]) => ({
      timestamp,
      associations
    }))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  
  return timestampGroups;
};
