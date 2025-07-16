
import { useState, useMemo } from 'react';
import { generateMockAssociations } from '../data/mockData';
import { ClientAssociationGroup, AssociationWithRelations } from '../types/associationsTypes';

export const useAssociationsList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dados mockados - futuramente será substituído por chamada à API
  const associations = useMemo(() => generateMockAssociations(), []);
  
  // Agrupar associações por cliente
  const clientGroups = useMemo(() => {
    const groups = new Map<string, ClientAssociationGroup>();
    
    associations.forEach(association => {
      const clientId = association.client_id;
      
      if (!groups.has(clientId)) {
        groups.set(clientId, {
          client: association.client,
          associations: [],
          totalAssociations: 0,
          activeAssociations: 0,
          inactiveAssociations: 0
        });
      }
      
      const group = groups.get(clientId)!;
      group.associations.push(association);
      group.totalAssociations++;
      
      if (association.status) {
        group.activeAssociations++;
      } else {
        group.inactiveAssociations++;
      }
    });
    
    return Array.from(groups.values());
  }, [associations]);
  
  const stats = useMemo(() => ({
    totalClients: clientGroups.length,
    totalAssociations: clientGroups.reduce((sum, group) => sum + group.totalAssociations, 0),
    activeAssociations: clientGroups.reduce((sum, group) => sum + group.activeAssociations, 0),
    inactiveAssociations: clientGroups.reduce((sum, group) => sum + group.inactiveAssociations, 0)
  }), [clientGroups]);
  
  return {
    clientGroups,
    stats,
    loading,
    error,
    associations
  };
};
