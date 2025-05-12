
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Asset, AssetStatus, StatusRecord, Client } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { AssetContextType } from '../AssetContextTypes';
import { 
  useAssetOperations, 
  useClientOperations, 
  useHistoryOperations, 
  useStatusMapping 
} from './hooks';
import { toast } from '@/utils/toast';

// Define the default context value
const defaultContextValue: AssetContextType = {
  assets: [],
  clients: [],
  history: [],
  loading: false,
  statusRecords: [],
  addAsset: async () => null,
  updateAsset: async () => null,
  deleteAsset: async () => false,
  getAssetById: () => undefined,
  getAssetsByStatus: () => [],
  getAssetsByType: () => [],
  addClient: () => {},
  updateClient: () => {},
  deleteClient: () => {},
  getClientById: () => undefined,
  associateAssetToClient: () => {},
  removeAssetFromClient: () => {},
  getExpiredSubscriptions: () => [],
  returnAssetsToStock: () => {},
  extendSubscription: () => {},
  addHistoryEntry: () => {},
  getAssetHistory: () => [],
  getClientHistory: () => [],
};

export const AssetContext = createContext<AssetContextType>(defaultContextValue);

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State management
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [history, setHistory] = useState<AssetHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusRecords, setStatusRecords] = useState<StatusRecord[]>([]);
  const [pageInfo, setPageInfo] = useState({ currentPage: 1, hasMorePages: true });

  // Use our custom hooks
  const { 
    loadStatusRecords, 
    mapStatusIdToAssetStatus, 
    mapAssetStatusToId 
  } = useStatusMapping(setStatusRecords);

  // Hook for history operations
  const { 
    addHistoryEntry, 
    getAssetHistory, 
    getClientHistory 
  } = useHistoryOperations(history, setHistory);

  // Hook for client operations
  const { 
    getClientById, 
    addClient, 
    updateClient, 
    deleteClient 
  } = useClientOperations(clients, setClients);

  // Function to wrap mapStatusIdToAssetStatus to match the expected signature
  const mapStatusIdWrapper = useCallback((statusId: number): AssetStatus => {
    return mapStatusIdToAssetStatus(statusId, statusRecords);
  }, [statusRecords, mapStatusIdToAssetStatus]);

  // Function to wrap mapAssetStatusToId to match the expected signature
  const mapStatusToIdWrapper = useCallback((status: AssetStatus): number => {
    return mapAssetStatusToId(status, statusRecords);
  }, [statusRecords, mapAssetStatusToId]);

  // Hook for asset operations (combining core, mutation, and client operations)
  const {
    loadAssets,
    loadMultiplePages,
    addAsset,
    updateAsset,
    deleteAsset,
    getAssetById,
    filterAssets,
    getAssetsByStatus,
    getAssetsByType,
    associateAssetToClient,
    removeAssetFromClient,
    returnAssetsToStock,
    getExpiredSubscriptions,
    extendSubscription
  } = useAssetOperations(
    assets,
    setAssets,
    statusRecords,
    mapStatusIdWrapper,
    mapStatusToIdWrapper,
    clients,
    addHistoryEntry
  );

  // Load status records from the database
  useEffect(() => {
    console.log('🚀 Carregando registros de status...');
    loadStatusRecords();
  }, []);

  // Load assets after status records are loaded with pagination
  useEffect(() => {
    const loadInitialBatch = async () => {
      if (statusRecords.length > 0) {
        console.log('📦 Carregando lote inicial de ativos...');
        setLoading(true);
        try {
          // Carregar os primeiros 2 lotes de ativos para ter dados suficientes rapidamente
          const hasMore = await loadMultiplePages(1, 2, 25);
          setPageInfo(prev => ({ ...prev, hasMorePages: hasMore }));
        } catch (error) {
          console.error('Erro ao carregar ativos:', error);
          toast.error('Erro ao carregar ativos');
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadInitialBatch();
  }, [statusRecords, loadMultiplePages]);

  // Função para carregar mais ativos sob demanda
  const loadMoreAssets = useCallback(async () => {
    if (pageInfo.hasMorePages && !loading) {
      setLoading(true);
      try {
        const nextPage = pageInfo.currentPage + 1;
        const hasMore = await loadAssets(nextPage, 25);
        
        setPageInfo({
          currentPage: nextPage,
          hasMorePages: hasMore
        });
      } catch (error) {
        console.error('Erro ao carregar mais ativos:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [pageInfo, loading, loadAssets]);

  return (
    <AssetContext.Provider
      value={{
        assets,
        clients,
        history,
        loading,
        statusRecords,
        addAsset,
        updateAsset,
        deleteAsset,
        getAssetById,
        filterAssets,
        getAssetsByStatus,
        getAssetsByType,
        addClient,
        updateClient,
        deleteClient,
        getClientById,
        associateAssetToClient,
        removeAssetFromClient,
        getExpiredSubscriptions,
        returnAssetsToStock,
        extendSubscription,
        addHistoryEntry,
        getAssetHistory,
        getClientHistory,
        loadMoreAssets, // Nova função para carregar mais ativos sob demanda
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};
