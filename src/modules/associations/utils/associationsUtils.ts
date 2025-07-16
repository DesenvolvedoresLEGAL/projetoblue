
import { AssociationWithDetails, AssociationGroup } from '../types/associationsList';

export const groupAssociationsByClient = (associations: AssociationWithDetails[]): AssociationGroup[] => {
  const groups = new Map<string, AssociationGroup>();

  associations.forEach(association => {
    const clientId = association.client_id;
    
    if (!groups.has(clientId)) {
      groups.set(clientId, {
        client_id: clientId,
        client_name: association.client_name,
        client_contato: association.client_contato,
        client_responsavel: association.client_responsavel,
        client_empresa: association.client_empresa,
        client_email: association.client_email,
        total_associations: 0,
        active_associations: 0,
        inactive_associations: 0,
        associations: [],
        is_expanded: false
      });
    }

    const group = groups.get(clientId)!;
    group.associations.push(association);
    group.total_associations++;
    
    if (association.status) {
      group.active_associations++;
    } else {
      group.inactive_associations++;
    }
  });

  // Sort associations within each group
  groups.forEach(group => {
    group.associations.sort((a, b) => {
      // First by status (active first)
      if (a.status !== b.status) {
        return a.status ? -1 : 1;
      }
      
      // Then by priority (solution_id 1,2,4 first)
      const aPriority = a.equipment_solution_id && [1, 2, 4].includes(a.equipment_solution_id);
      const bPriority = b.equipment_solution_id && [1, 2, 4].includes(b.equipment_solution_id);
      
      if (aPriority !== bPriority) {
        return aPriority ? -1 : 1;
      }
      
      // Then by type: equipment first, then chips
      const aIsEquipment = !!a.equipment_id;
      const bIsEquipment = !!b.equipment_id;
      
      if (aIsEquipment !== bIsEquipment) {
        return aIsEquipment ? -1 : 1;
      }
      
      // Finally by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  // Convert to array and sort by client name
  return Array.from(groups.values()).sort((a, b) => 
    a.client_name.localeCompare(b.client_name)
  );
};

export const formatICCID = (iccid: string | null): string => {
  if (!iccid) return '';
  
  if (iccid.length >= 6) {
    return '****' + iccid.slice(-6);
  }
  
  return iccid;
};

export const getAssetDisplayName = (association: AssociationWithDetails): string => {
  if (association.equipment_radio) {
    return association.equipment_radio;
  }
  
  if (association.chip_iccid) {
    const maskedICCID = formatICCID(association.chip_iccid);
    const operator = association.chip_is_operator ? ` (${association.chip_manufacturer_name})` : '';
    return maskedICCID + operator;
  }
  
  return 'N/A';
};

export const getAssetTypeBadgeColor = (association: AssociationWithDetails): string => {
  if (association.equipment_solution_id && [1, 2, 4].includes(association.equipment_solution_id)) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
  
  if (association.chip_id && !association.equipment_id) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }
  
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
};

export const getAssetTypeLabel = (association: AssociationWithDetails): string => {
  if (association.equipment_solution_name) {
    return association.equipment_solution_name;
  }
  
  if (association.chip_id && !association.equipment_id) {
    return 'Chip';
  }
  
  return 'N/A';
};
