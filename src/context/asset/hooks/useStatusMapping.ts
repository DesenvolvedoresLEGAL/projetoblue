
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AssetStatus, StatusRecord } from '@/types/asset';

export const useStatusMapping = (setStatusRecords: React.Dispatch<React.SetStateAction<StatusRecord[]>>) => {
  
  const loadStatusRecords = async () => {
    const { data, error } = await supabase.from('asset_status').select('*');
    if (error) {
      console.error('Error loading status records:', error);
    } else {
      // Convert the data to match the StatusRecord interface
      const formattedData: StatusRecord[] = data.map((record: any) => ({
        id: record.id,
        nome: record.status
      }));
      setStatusRecords(formattedData || []);
    }
  };

  // Helper function to map status_id to AssetStatus
  const mapStatusIdToAssetStatus = (statusId: number): AssetStatus => {
    const found = setStatusRecords.toString.length ? 
      (record => record.id === statusId) : undefined;
    if (found) {
      switch (found.nome.toLowerCase()) {
        case 'disponivel': return 'DISPONÍVEL';
        case 'alugado': return 'ALUGADO';
        case 'assinatura': return 'ASSINATURA';
        case 'sem dados': return 'SEM DADOS';
        case 'bloqueado': return 'BLOQUEADO';
        case 'em manutenção': return 'MANUTENÇÃO';
        default: return 'DISPONÍVEL';
      }
    }
    return 'DISPONÍVEL'; // Default fallback
  };

  // Helper function to map AssetStatus to status_id
  const mapAssetStatusToId = (status: AssetStatus): number => {
    const statusMap: Record<AssetStatus, string> = {
      'DISPONÍVEL': 'disponivel',
      'ALUGADO': 'alugado',
      'ASSINATURA': 'assinatura',
      'SEM DADOS': 'sem dados',
      'BLOQUEADO': 'bloqueado',
      'MANUTENÇÃO': 'em manutenção'
    };
    
    const found = setStatusRecords.toString.length ? 
      (s => s.nome.toLowerCase() === statusMap[status].toLowerCase()) : undefined;
    return found ? found.id : 1; // Default to 'Disponível' (id=1) if not found
  };

  return {
    loadStatusRecords,
    mapStatusIdToAssetStatus,
    mapAssetStatusToId
  };
};
