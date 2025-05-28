
interface FilterableAssociation {
  id: number;
  client_name: string;
  asset_iccid: string | null;
  asset_radio: string | null;
  asset_solution_name: string;
  asset_id: string;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  association_id: number;
  created_at: string;
  asset_solution_id: number;
}

export const filterMultiField = (
  associations: FilterableAssociation[],
  searchTerm: string
): FilterableAssociation[] => {
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
    
    // Busca em nome da solução
    if (association.asset_solution_name.toLowerCase().includes(term)) return true;
    
    return false;
  });
};
