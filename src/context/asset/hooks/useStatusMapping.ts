
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AssetStatus } from '@/types/asset';
import { toast } from '@/utils/toast';

export const useStatusMapping = (
  setStatusRecords: React.Dispatch<React.SetStateAction<any[]>>
) => {

  const loadStatusRecords = async () => {
    try {
      const { data, error } = await supabase.from('asset_status').select('*');
      if (error) {
        console.error('Error loading status records:', error);
        toast.error('Erro ao carregar status dos ativos');
      } else {
        // Convert the data to match the StatusRecord interface
        const formattedData = data.map((record: any) => ({
          id: record.id,
          nome: record.status
        }));
        setStatusRecords(formattedData || []);
      }
    } catch (error) {
      console.error('Error in loadStatusRecords:', error);
      toast.error('Erro ao carregar status dos ativos');
    }
  };

  // Helper function to map status_id to AssetStatus
  const mapStatusIdToAssetStatus = (statusId: number): AssetStatus => {
    // Get current status records from the parent component
    const statusRecords = JSON.parse(localStorage.getItem('statusRecords') || '[]');
    
    const found = statusRecords.find((s: any) => s.id === statusId);
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
    // Get current status records from the parent component
    const statusRecords = JSON.parse(localStorage.getItem('statusRecords') || '[]');
    
    const statusMap: Record<AssetStatus, string> = {
      'DISPONÍVEL': 'disponivel',
      'ALUGADO': 'alugado',
      'ASSINATURA': 'assinatura',
      'SEM DADOS': 'sem dados',
      'BLOQUEADO': 'bloqueado',
      'MANUTENÇÃO': 'em manutenção'
    };
    
    const found = statusRecords.find((s: any) => s.nome.toLowerCase() === statusMap[status].toLowerCase());
    return found ? found.id : 1; // Default to 'Disponível' (id=1) if not found
  };

  // Save status records to localStorage when they change
  useEffect(() => {
    loadStatusRecords();
  }, []);

  return { 
    loadStatusRecords, 
    mapStatusIdToAssetStatus, 
    mapAssetStatusToId 
  };
};
