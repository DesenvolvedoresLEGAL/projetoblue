
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SelectedAsset } from '@modules/associations/types';

interface UseAvailableChipsProps {
  selectedAssets?: SelectedAsset[];
  excludeAssociatedToClient?: string;
}

export const useAvailableChips = ({
  selectedAssets = [],
  excludeAssociatedToClient
}: UseAvailableChipsProps = {}) => {
  const { data: chips = [], isLoading, error } = useQuery({
    queryKey: ['available-chips', excludeAssociatedToClient],
    queryFn: async () => {
      console.log('useAvailableChips: Buscando CHIPs disponíveis');

      let query = supabase
        .from('assets')
        .select(`
          uuid,
          line_number,
          iccid,
          status_id,
          solution_id,
          manufacturer_id,
          created_at,
          asset_status!inner(status),
          manufacturers(name)
        `)
        .eq('solution_id', 11) // Apenas CHIPs
        .eq('status_id', 1) // Apenas disponíveis
        .is('deleted_at', null);

      // Excluir CHIPs já associados ao cliente específico
      if (excludeAssociatedToClient) {
        const { data: associatedChips } = await supabase
          .from('associations')
          .select('chip_id')
          .eq('client_id', excludeAssociatedToClient)
          .eq('status', true)
          .is('deleted_at', null)
          .not('chip_id', 'is', null);

        if (associatedChips && associatedChips.length > 0) {
          const excludeIds = associatedChips.map(a => a.chip_id).filter(Boolean);
          if (excludeIds.length > 0) {
            query = query.not('uuid', 'in', `(${excludeIds.join(',')})`);
          }
        }
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('useAvailableChips: Erro na busca:', error);
        throw error;
      }

      return (data || []).map(chip => ({
        id: chip.uuid,
        uuid: chip.uuid,
        line_number: chip.line_number?.toString(),
        iccid: chip.iccid,
        statusId: chip.status_id,
        solution_id: chip.solution_id,
        manufacturer_id: chip.manufacturer_id,
        status: chip.asset_status?.status,
        marca: chip.manufacturers?.name,
        type: 'CHIP' as const,
        registrationDate: chip.created_at || new Date().toISOString(),
        solucao: 'CHIP'
      })) as SelectedAsset[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  // Filtrar CHIPs já selecionados
  const availableChips = chips.filter(chip => 
    !selectedAssets.some(selected => selected.uuid === chip.uuid)
  );

  return {
    chips: availableChips,
    isLoading,
    error
  };
};
