
import { Asset, AssetStatus, AssetType, Client, SubscriptionInfo, StatusRecord } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { useAssetCore } from './operations/useAssetCore';
import { useAssetMutation } from './operations/useAssetMutation';
import { useAssetClient } from './operations/useAssetClient';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

export const useAssetOperations = (
  assets: Asset[],
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>,
  statusRecords: StatusRecord[],
  mapStatusIdToAssetStatus: (statusId: number) => AssetStatus,
  mapAssetStatusToId: (status: AssetStatus) => number,
  clients?: Client[],
  addHistoryEntry?: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  // Função para carregamento de ativos com paginação e batching
  const loadAssets = useCallback(async (page = 1, pageSize = 50) => {
    console.time('load-assets-batch');
    console.log(`📊 Carregando ativos - página ${page}, tamanho ${pageSize}`);
    
    try {
      const { data: assetsData, error } = await supabase
        .from('assets')
        .select('*')
        .range((page - 1) * pageSize, page * pageSize - 1);
        
      if (error) {
        console.error('❌ Erro ao carregar ativos:', error);
        throw error;
      }
      
      console.log(`✅ Carregados ${assetsData.length} ativos`);
      
      // Transformar os dados do banco para o formato da aplicação
      const mappedAssets: Asset[] = assetsData.map((asset: any) => {
        const assetStatus = mapStatusIdToAssetStatus(asset.status_id);
        
        if (asset.type_id === 1) {
          // CHIP
          return {
            id: asset.uuid,
            type: 'CHIP',
            registrationDate: new Date(asset.created_at || new Date()).toISOString(),
            status: assetStatus,
            statusId: asset.status_id,
            iccid: asset.iccid || '',
            phoneNumber: asset.line_number?.toString() || '',
            carrier: asset.manufacturer_id?.toString() || '',
            notes: asset.notes || ''
          } as Asset;
        } else {
          // ROTEADOR
          return {
            id: asset.uuid,
            type: 'ROTEADOR',
            registrationDate: new Date(asset.created_at || new Date()).toISOString(),
            status: assetStatus,
            statusId: asset.status_id,
            uniqueId: asset.serial_number || '',
            brand: asset.manufacturer_id?.toString() || '',
            model: asset.model || '',
            ssid: asset.ssid || '',
            password: asset.password || '',
            serialNumber: asset.serial_number || '',
            notes: asset.notes || ''
          } as Asset;
        }
      });
      
      // Atualizar o estado com os novos ativos
      if (page === 1) {
        setAssets(mappedAssets); // Primeira página substitui completamente
      } else {
        setAssets(prev => [...prev, ...mappedAssets]); // Páginas subsequentes adicionam
      }
      
      console.timeEnd('load-assets-batch');
      
      // Se recebemos menos itens que o tamanho da página, terminamos
      if (assetsData.length < pageSize) {
        return false; // Não há mais páginas
      }
      return true; // Há mais páginas
      
    } catch (error) {
      console.error('Erro ao carregar ativos:', error);
      console.timeEnd('load-assets-batch');
      return false;
    }
  }, [mapStatusIdToAssetStatus, setAssets]);
  
  // Função para carregar múltiplas páginas em batch para pré-carregar dados
  const loadMultiplePages = useCallback(async (startPage = 1, numPages = 3, pageSize = 50) => {
    console.time('load-multiple-pages');
    console.log(`🔄 Carregando ${numPages} páginas de ativos`);
    
    const promises = [];
    for (let i = 0; i < numPages; i++) {
      const page = startPage + i;
      promises.push(loadAssets(page, pageSize));
    }
    
    try {
      const results = await Promise.all(promises);
      console.log(`✅ Carregamento em batch concluído`);
      console.timeEnd('load-multiple-pages');
      return results.some(hasMore => hasMore); // Retorna true se pelo menos uma página tem mais dados
    } catch (error) {
      console.error('Erro ao carregar múltiplas páginas:', error);
      console.timeEnd('load-multiple-pages');
      return false;
    }
  }, [loadAssets]);

  // Core asset operations (loading, filtering, basic getters)
  const coreOperations = useAssetCore(
    assets,
    setAssets,
    statusRecords,
    mapStatusIdToAssetStatus,
    mapAssetStatusToId
  );

  // Mutation operations (add, update, delete)
  const mutationOperations = useAssetMutation(
    assets,
    setAssets,
    mapStatusIdToAssetStatus,
    mapAssetStatusToId,
    statusRecords
  );

  // Client-related operations
  const clientOperations = useAssetClient(
    assets,
    mutationOperations.updateAsset,
    clients,
    addHistoryEntry
  );

  // Return all operations combined
  return {
    ...coreOperations,
    ...mutationOperations,
    ...clientOperations,
    loadAssets,         // Add the new paged loading function
    loadMultiplePages   // Add batch loading function
  };
};
