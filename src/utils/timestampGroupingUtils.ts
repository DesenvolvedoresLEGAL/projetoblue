
import { Association } from '@/types/associations';

export interface CompanyGroup {
  client_id: string;
  client_name: string;
  entry_date: string;
  exit_date: string | null;
  associations: Association[];
  asset_types?: { [key: string]: number };
}

export interface ClientStartDateGroup {
  groupKey: string; // client_id + entry_date
  client_id: string;
  client_name: string;
  entry_date: string;
  companyGroups: CompanyGroup[];
  totalAssociations: number;
}

/**
 * Agrupa associações por cliente e data de entrada (entry_date)
 * Elimina a camada de agrupamento por timestamp de criação
 */
export const groupAssociationsByClientAndStartDate = (associations: Association[]): ClientStartDateGroup[] => {
  const clientStartDateGroups: { [key: string]: Association[] } = {};
  
  // Agrupar por client_id + entry_date
  associations.forEach(association => {
    const groupKey = `${association.client_id}_${association.entry_date}`;
    
    if (!clientStartDateGroups[groupKey]) {
      clientStartDateGroups[groupKey] = [];
    }
    
    clientStartDateGroups[groupKey].push(association);
  });
  
  // Converter para array e criar ClientStartDateGroup
  const finalGroups: ClientStartDateGroup[] = Object.entries(clientStartDateGroups)
    .map(([groupKey, associations]) => {
      // Como todas as associações no grupo têm o mesmo cliente e entry_date,
      // podemos pegar os dados do primeiro item
      const firstAssociation = associations[0];
      
      // Calcular tipos de assets
      const assetTypes: { [key: string]: number } = {};
      associations.forEach(association => {
        const solutionName = association.asset_solution_name || 'Desconhecido';
        assetTypes[solutionName] = (assetTypes[solutionName] || 0) + 1;
      });

      // Criar um único CompanyGroup já que todas as associações são do mesmo cliente
      const companyGroup: CompanyGroup = {
        client_id: firstAssociation.client_id,
        client_name: firstAssociation.client_name,
        entry_date: firstAssociation.entry_date,
        exit_date: firstAssociation.exit_date,
        associations,
        asset_types: assetTypes
      };

      return {
        groupKey,
        client_id: firstAssociation.client_id,
        client_name: firstAssociation.client_name,
        entry_date: firstAssociation.entry_date,
        companyGroups: [companyGroup],
        totalAssociations: associations.length
      };
    })
    .sort((a, b) => {
      // Primeiro por data de entrada (mais recentes primeiro)
      const dateComparison = b.entry_date.localeCompare(a.entry_date);
      if (dateComparison !== 0) return dateComparison;
      
      // Depois por nome do cliente
      return a.client_name.localeCompare(b.client_name);
    });
  
  return finalGroups;
};

/**
 * Conta o total de associações e grupos para a nova estrutura
 */
export const getClientStartDateGroupStats = (groups: ClientStartDateGroup[]) => {
  const totalAssociations = groups.reduce((sum, group) => sum + group.totalAssociations, 0);
  const totalClientStartDateGroups = groups.length;
  const totalCompanyGroups = groups.reduce((sum, group) => sum + group.companyGroups.length, 0);
  
  return {
    totalAssociations,
    totalClientStartDateGroups,
    totalCompanyGroups
  };
};

// Manter funções originais para compatibilidade (caso sejam usadas em outros lugares)
export interface TimestampGroup {
  timestamp: string; 
  companyGroups: CompanyGroup[];
  totalAssociations: number;
}

export const truncateToMinute = (timestamp: string): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const groupAssociationsByTimestampAndCompany = (associations: Association[]): TimestampGroup[] => {
  const timestampGroups: { [key: string]: Association[] } = {};
  
  associations.forEach(association => {
    const timestampKey = truncateToMinute(association.created_at);
    
    if (!timestampGroups[timestampKey]) {
      timestampGroups[timestampKey] = [];
    }
    
    timestampGroups[timestampKey].push(association);
  });
  
  const finalGroups: TimestampGroup[] = Object.entries(timestampGroups)
    .map(([timestamp, associations]) => {
      const companyGroups: { [key: string]: Association[] } = {};
      
      associations.forEach(association => {
        const companyKey = association.client_name;
        
        if (!companyGroups[companyKey]) {
          companyGroups[companyKey] = [];
        }
        
        companyGroups[companyKey].push(association);
      });
      
      const companyGroupsArray: CompanyGroup[] = Object.entries(companyGroups)
        .map(([companyName, associations]) => {
          const assetTypes: { [key: string]: number } = {};
          associations.forEach(association => {
            const solutionName = association.asset_solution_name || 'Desconhecido';
            assetTypes[solutionName] = (assetTypes[solutionName] || 0) + 1;
          });

          const firstAssociation = associations[0];
          
          return {
            client_id: firstAssociation.client_id,
            client_name: companyName,
            entry_date: firstAssociation.entry_date,
            exit_date: firstAssociation.exit_date,
            associations,
            asset_types: assetTypes
          };
        })
        .sort((a, b) => a.client_name.localeCompare(b.client_name));
      
      return {
        timestamp,
        companyGroups: companyGroupsArray,
        totalAssociations: associations.length
      };
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  
  return finalGroups;
};

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

// Funções legadas mantidas para compatibilidade
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
