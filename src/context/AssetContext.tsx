import React, { createContext, useState, useEffect } from 'react';
import { Asset, AssetType, ChipAsset, RouterAsset, AssetStatus, StatusRecord } from '@/types/asset';
import * as assetActions from './assetActions';
import { toast } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { AssetContextType } from './AssetContextTypes';
import { Client } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { assetService } from '@/services/assetService';
import { clientService } from '@/services/clientService';
import { historyService } from '@/services/historyService';
import { mapAssetStatusToId } from '@/utils/assetMappers';

// Definindo o valor padrão para o contexto
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
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [history, setHistory] = useState<AssetHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusRecords, setStatusRecords] = useState<StatusRecord[]>([]);

  // Load status records from the database
  useEffect(() => {
    const fetchStatusRecords = async () => {
      const records = await assetService.fetchStatusRecords();
      setStatusRecords(records);
    };
    
    fetchStatusRecords();
  }, []);

  // Load assets from the database
  useEffect(() => {
    const loadAssets = async () => {
      if (statusRecords.length === 0) return;
      
      setLoading(true);
      try {
        const fetchedAssets = await assetService.fetchAssets(statusRecords);
        setAssets(fetchedAssets);
      } catch (error) {
        console.error('Error loading assets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, [statusRecords]);

  // Load clients and their asset associations
  useEffect(() => {
    const loadClients = async () => {
      try {
        const fetchedClients = await clientService.fetchClients();
        setClients(fetchedClients);
        
        // Load asset-client associations
        await clientService.fetchAssetClientAssociations(fetchedClients);
      } catch (error) {
        console.error('Error loading clients:', error);
      }
    };
    
    loadClients();
  }, []);

  // CRUD operations for assets
  const addAsset = async (assetData: Omit<Asset, "id" | "status">): Promise<Asset | null> => {
    const newAsset = await assetService.addAsset(assetData, statusRecords);
    if (newAsset) {
      setAssets(prevAssets => [...prevAssets, newAsset]);
    }
    return newAsset;
  };

  const updateAsset = async (id: string, assetData: Partial<Asset>): Promise<Asset | null> => {
    const updatedAsset = await assetService.updateAsset(id, assetData, statusRecords);
    if (updatedAsset) {
      setAssets(prevAssets => prevAssets.map(asset => 
        asset.id === id ? updatedAsset : asset
      ));
    }
    return updatedAsset;
  };

  const deleteAsset = async (id: string): Promise<boolean> => {
    const success = await assetService.deleteAsset(id);
    if (success) {
      setAssets(prevAssets => prevAssets.filter(asset => asset.id !== id));
    }
    return success;
  };

  // Helper functions for assets
  const getAssetById = (id: string) => {
    return assetActions.getAssetById(assets, id);
  };

  const getAssetsByStatus = (status: AssetStatus) => {
    return assets.filter(asset => asset.status === status);
  };

  const getAssetsByType = (type: AssetType) => {
    return assets.filter(asset => asset.type === type);
  };

  // History operations
  const addHistoryEntry = (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => {
    historyService.addHistoryEntry(history, setHistory, entry);
  };

  const getAssetHistory = (assetId: string): AssetHistoryEntry[] => {
    return historyService.getAssetHistory(history, assetId);
  };
  
  const getClientHistory = (clientId: string): AssetHistoryEntry[] => {
    return historyService.getClientHistory(history, clientId);
  };

  // Asset-Client operations
  const associateAssetToClient = (assetId: string, clientId: string) => {
    const asset = getAssetById(assetId);
    const client = clientService.getClientById(clients, clientId);
    
    if (asset && client) {
      // Update asset with client association
      updateAsset(assetId, { clientId, status: "ALUGADO", statusId: 2 });
      
      // Update client's assets list
      const updatedClient = { ...client };
      if (!updatedClient.assets.includes(assetId)) {
        updatedClient.assets = [...updatedClient.assets, assetId];
        setClients(prevClients => prevClients.map(c => 
          c.id === clientId ? updatedClient : c
        ));
      }
      
      // Add history entry
      addHistoryEntry({
        clientId,
        clientName: client.name,
        assetIds: [assetId],
        assets: [{
          id: assetId,
          type: asset.type,
          identifier: asset.type === "CHIP" ? asset.id : asset.id
        }],
        operationType: "ALUGUEL",
        comments: `Ativo associado ao cliente ${client.name}`
      });
      
      toast.success("Ativo vinculado ao cliente com sucesso!");
    }
  };

  const removeAssetFromClient = (assetId: string, clientId: string) => {
    const asset = getAssetById(assetId);
    const client = clientService.getClientById(clients, clientId);
    
    if (asset && client) {
      // Update asset to remove client association and set status to available
      updateAsset(assetId, { 
        clientId: undefined, 
        status: "DISPONÍVEL",
        statusId: mapAssetStatusToId("DISPONÍVEL", statusRecords)
      });
      
      // Update client's assets list
      const updatedClient = { ...client };
      updatedClient.assets = updatedClient.assets.filter(id => id !== assetId);
      setClients(prevClients => prevClients.map(c => 
        c.id === clientId ? updatedClient : c
      ));
      
      // Add history entry
      addHistoryEntry({
        clientId,
        clientName: client.name,
        assetIds: [assetId],
        assets: [{
          id: assetId,
          type: asset.type,
          identifier: asset.type === "CHIP" ? asset.id : asset.id
        }],
        operationType: asset.status === "ASSINATURA" ? "ASSINATURA" : "ALUGUEL",
        event: "Retorno ao estoque",
        comments: `Ativo ${asset.id} removido do cliente ${client.name}`
      });
      
      toast.success("Ativo desvinculado do cliente com sucesso!");
    }
  };

  const returnAssetsToStock = (assetIds: string[]) => {
    assetIds.forEach(assetId => {
      const asset = getAssetById(assetId);
      if (asset && asset.clientId) {
        removeAssetFromClient(assetId, asset.clientId);
      }
    });
  };

  const extendSubscription = (assetId: string, newEndDate: string) => {
    const asset = getAssetById(assetId);
    if (asset && asset.subscription && asset.clientId) {
      const client = clientService.getClientById(clients, asset.clientId);
      
      updateAsset(assetId, {
        subscription: {
          ...asset.subscription,
          endDate: newEndDate,
          isExpired: false
        }
      });
      
      if (client) {
        addHistoryEntry({
          clientId: asset.clientId,
          clientName: client.name,
          assetIds: [asset.id],
          assets: [{
            id: asset.id,
            type: asset.type,
            identifier: asset.id
          }],
          operationType: "ASSINATURA",
          event: "Extensão de assinatura",
          comments: `Assinatura do ativo ${asset.id} estendida até ${new Date(newEndDate).toLocaleDateString('pt-BR')}`
        });
      }
      
      toast.success("Assinatura estendida com sucesso!");
    }
  };

  // Client operations - placeholders for now
  const addClient = () => {
    // Implementation to be added when needed
  };
  
  const updateClient = () => {
    // Implementation to be added when needed
  };
  
  const deleteClient = () => {
    // Implementation to be added when needed
  };

  const getExpiredSubscriptions = () => {
    return assets.filter(asset => 
      asset.subscription && asset.subscription.isExpired
    );
  };

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
        getAssetsByStatus,
        getAssetsByType,
        addClient,
        updateClient,
        deleteClient,
        getClientById: (id) => clientService.getClientById(clients, id),
        associateAssetToClient,
        removeAssetFromClient,
        getExpiredSubscriptions,
        returnAssetsToStock,
        extendSubscription,
        addHistoryEntry,
        getAssetHistory,
        getClientHistory,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};
