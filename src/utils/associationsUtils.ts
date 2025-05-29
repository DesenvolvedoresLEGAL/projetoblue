
import { Association, AssociationGroup } from '@/types/associations';

// Função para filtro multicampo que funciona com a interface Association
export const filterMultiField = (
  associations: Association[],
  searchTerm: string
): Association[] => {
  if (!searchTerm.trim()) return associations;
  
  const term = searchTerm.toLowerCase();
  
  return associations.filter(association => {
    // Busca em ID
    if (association.id.toString().includes(term)) return true;
    
    // Busca em nome do cliente
    if (association.client_name.toLowerCase().includes(term)) return true;
    
    // Busca em ICCID
    if (association.asset_iccid?.toLowerCase().includes(term)) return true;
    
    // Busca em rádio
    if (association.asset_radio?.toLowerCase().includes(term)) return true;
    
    // Busca em linha
    if (association.asset_line_number?.toString().includes(term)) return true;
    
    // Busca em nome da solução
    if (association.asset_solution_name.toLowerCase().includes(term)) return true;
    
    return false;
  });
};

// Função para agrupamento melhorado por cliente e datas
export const groupAssociationsByClientAndDates = (associations: Association[]) => {
  const groups: { [key: string]: AssociationGroup } = {};

  associations.forEach(association => {
    const groupKey = `${association.client_id}_${association.entry_date}_${association.exit_date || 'null'}`;
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        groupKey,
        client_name: association.client_name,
        client_id: association.client_id,
        entry_date: association.entry_date,
        exit_date: association.exit_date,
        associations: [],
        totalAssets: 0,
        assetTypes: {},
        canEndGroup: true
      };
    }
    
    groups[groupKey].associations.push(association);
    groups[groupKey].totalAssets++;
    
    // Contar tipos de ativos
    const assetType = association.asset_solution_name;
    groups[groupKey].assetTypes[assetType] = (groups[groupKey].assetTypes[assetType] || 0) + 1;
    
    // Verificar se pode encerrar o grupo (função canBeEndedManually inline)
    const canEnd = !association.exit_date || association.exit_date >= new Date().toISOString().split('T')[0];
    if (!canEnd) {
      groups[groupKey].canEndGroup = false;
    }
  });
  
  return groups;
};

// Função para sanitizar termo de busca
export const sanitizeSearchTerm = (term: string) => {
  if (!term) return '';
  return term.replace(/['"\\%_]/g, '').trim();
};
