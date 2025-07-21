
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { associationService } from '../services/associationService';
import { ClientAssociationGroup, AssociationWithRelations, AssociationStats } from '../types/associationsTypes';
import { getChipType } from '../utils/chipUtils';

export const useAssociationsList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Buscar dados reais da API
  const {
    data: associations = [],
    isLoading: initialLoading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['associations', refreshKey],
    queryFn: async () => {
     
      const data = await associationService.getAll();
     
      return data;
    },
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  // Processar associações para adicionar informações derivadas
  const processedAssociations = useMemo(() => {
    return associations.map(association => ({
      ...association,
      chipType: getChipType(association),
      hasNonChipAssets: Boolean(association.equipment?.solution_id && association.equipment.solution_id !== 11)
    }));
  }, [associations]);
  
  // Agrupar associações por cliente
  const clientGroups = useMemo(() => {
    const groups = new Map<string, ClientAssociationGroup>();
    
    processedAssociations.forEach(association => {
      const clientId = association.client_id;
      
      if (!groups.has(clientId)) {
        groups.set(clientId, {
          client: association.client,
          associations: [],
          totalAssociations: 0,
          activeAssociations: 0,
          inactiveAssociations: 0,
          principalChips: 0,
          backupChips: 0,
          equipmentOnly: 0
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

      // Contabilizar tipos de associação
      switch (association.chipType) {
        case 'principal':
          group.principalChips++;
          break;
        case 'backup':
          group.backupChips++;
          break;
        case 'none':
          if (association.equipment_id) {
            group.equipmentOnly++;
          }
          break;
      }
    });
    
    return Array.from(groups.values());
  }, [processedAssociations]);
  
  const stats: AssociationStats = useMemo(() => {
    const totals = clientGroups.reduce((acc, group) => ({
      totalClients: acc.totalClients + 1,
      totalAssociations: acc.totalAssociations + group.totalAssociations,
      activeAssociations: acc.activeAssociations + group.activeAssociations,
      inactiveAssociations: acc.inactiveAssociations + group.inactiveAssociations,
      principalChips: acc.principalChips + group.principalChips,
      backupChips: acc.backupChips + group.backupChips,
      equipmentOnly: acc.equipmentOnly + group.equipmentOnly
    }), {
      totalClients: 0,
      totalAssociations: 0,
      activeAssociations: 0,
      inactiveAssociations: 0,
      principalChips: 0,
      backupChips: 0,
      equipmentOnly: 0
    });

    return totals;
  }, [clientGroups]);
  
  const refresh = async () => {
    setRefreshKey(prev => prev + 1);
    await refetch();
  };

  // Atualizar estado de erro
  useEffect(() => {
    if (queryError) {
      setError(queryError.message || 'Erro ao carregar associações');
    } else {
      setError(null);
    }
  }, [queryError]);
  
  return {
    clientGroups,
    stats,
    loading,
    initialLoading,
    error,
    associations: processedAssociations,
    refresh
  };
};
