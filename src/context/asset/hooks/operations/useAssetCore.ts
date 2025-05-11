
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Asset, AssetType, ChipAsset, RouterAsset, AssetStatus, StatusRecord } from '@/types/asset';
import { toast } from '@/utils/toast';

export const useAssetCore = (
  assets: Asset[],
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>,
  statusRecords: StatusRecord[],
  mapStatusIdToAssetStatus: (statusId: number) => AssetStatus,
  mapAssetStatusToId: (status: AssetStatus) => number
) => {
  const loadAssets = async () => {
    try {
      // Buscar assets da tabela assets
      const { data: assetsData, error: assetsError } = await supabase
        .from('assets')
        .select('*');
      
      if (assetsError) {
        console.error('Erro ao carregar assets:', assetsError);
        throw assetsError;
      }
      
      // Converter os assets para o formato necessário
      const convertToAssetObject = (asset: any): Asset => {
        const baseAsset = {
          id: asset.uuid,
          registrationDate: new Date().toISOString(),
          status: mapStatusIdToAssetStatus(asset.status_id || 1),
          statusId: asset.status_id || 1,
          notes: "" // Notes/observations not available
        };
        
        if (asset.type_id === 1) {
          // É um chip
          return {
            ...baseAsset,
            type: "CHIP" as const,
            iccid: asset.iccid || '',
            phoneNumber: asset.line_number?.toString() || '',
            carrier: asset.manufacturer_id?.toString() || ''
          } as ChipAsset;
        } else {
          // É um roteador
          return {
            ...baseAsset,
            type: "ROTEADOR" as const,
            uniqueId: asset.uuid || '',
            brand: asset.manufacturer_id?.toString() || '',
            model: asset.model || '',
            ssid: '', // Não temos esses dados no schema atual
            password: asset.password || '',
            ipAddress: '', // Não temos esses dados no schema atual
            adminUser: '', // Não temos esses dados no schema atual
            adminPassword: '', // Não temos esses dados no schema atual
            imei: '', // Não temos esses dados no schema atual
            serialNumber: asset.serial_number || ''
          } as RouterAsset;
        }
      };
      
      // Converter os assets para o formato necessário
      const formattedAssets = assetsData?.map(convertToAssetObject) || [];
      setAssets(formattedAssets);
    } catch (error) {
      console.error('Erro ao carregar ativos:', error);
      toast.error('Erro ao carregar ativos');
    }
  };

  // Basic getters
  const getAssetById = (id: string) => {
    return assets.find(asset => asset.id === id);
  };

  const getAssetsByStatus = (status: AssetStatus) => {
    return assets.filter(asset => asset.status === status);
  };

  const getAssetsByType = (type: AssetType) => {
    return assets.filter(asset => asset.type === type);
  };

  const filterAssets = (criteria: any) => {
    let filteredAssets = [...assets];
    
    // Implementar lógica de filtragem se necessário
    // Exemplo: filtrar por tipo
    if (criteria.type) {
      filteredAssets = filteredAssets.filter(asset => asset.type === criteria.type);
    }
    
    // Exemplo: filtrar por status
    if (criteria.status) {
      filteredAssets = filteredAssets.filter(asset => asset.status === criteria.status);
    }
    
    return filteredAssets;
  };

  return {
    loadAssets,
    getAssetById,
    getAssetsByStatus,
    getAssetsByType,
    filterAssets
  };
};
