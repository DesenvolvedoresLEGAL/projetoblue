
import { Association, AssociationGroup } from '@/types/associations';

// Função para filtro multicampo melhorada que funciona com a interface Association
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
    
    // Busca por número sem formatação (remove tudo que não é número)
    const numericTerm = term.replace(/\D/g, '');
    if (numericTerm.length >= 4) {
      // Busca em linha por número
      if (association.asset_line_number?.toString().includes(numericTerm)) return true;
    }
    
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
    
    // Verificar se pode encerrar o grupo - lógica mais flexível
    // Um grupo pode ser encerrado se tem pelo menos uma associação ativa
    const today = new Date().toISOString().split('T')[0];
    const isAssociationActive = !association.exit_date || association.exit_date > today;
    
    // Se encontrarmos pelo menos uma associação ativa, o grupo pode ser encerrado
    if (isAssociationActive) {
      groups[groupKey].canEndGroup = true;
    }
  });
  
  // Verificar novamente a lógica canEndGroup para cada grupo
  Object.values(groups).forEach(group => {
    const today = new Date().toISOString().split('T')[0];
    const hasActiveAssociations = group.associations.some(a => 
      !a.exit_date || a.exit_date > today
    );
    group.canEndGroup = hasActiveAssociations;
  });
  
  return groups;
};

// Função para sanitizar termo de busca
export const sanitizeSearchTerm = (term: string) => {
  if (!term) return '';
  return term.replace(/['"\\%_]/g, '').trim();
};
