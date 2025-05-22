
import React, { createContext, useState, useEffect } from 'react';
import { Asset, AssetType, ChipAsset, RouterAsset, AssetStatus, StatusRecord } from '@/types/asset';
import * as assetActions from './assetActions';
import { toast } from '@/utils/toast';
import { AssetContextType } from './AssetContextTypes';
import { Client } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import assetService from '@/services/api/asset';
import { referenceDataService } from '@/services/api/referenceDataService';
import { supabase } from '@/integrations/supabase/client';
import { getValidAssetStatus } from '@/utils/assetUtils';

// Default context value
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

  // Load status records from the API
  useEffect(() => {
    const fetchStatusRecords = async () => {
      try {
        const records = await referenceDataService.getStatusRecords();
        setStatusRecords(records || []);
      } catch (error) {
        console.error('Error loading status records:', error);
        toast.error('Failed to load status records');
      }
    };
    
    fetchStatusRecords();
  }, []);

  // Helper function to map status_id to AssetStatus
  const mapStatusIdToAssetStatus = (statusId: number): AssetStatus => {
    const found = statusRecords.find(s => s.id === statusId);
    if (found) {
      switch (found.nome.toLowerCase()) {
        case 'disponivel': return "DISPONÍVEL";
        case 'alugado': return "ALUGADO";
        case 'assinatura': return "ASSINATURA";
        case 'sem dados': return "SEM DADOS";
        case 'bloqueado': return "BLOQUEADO";
        case 'em manutenção': return "MANUTENÇÃO";
        default: return "DISPONÍVEL";
      }
    }
    return "DISPONÍVEL"; // Default fallback
  };

  // Helper function to map AssetStatus to status_id
  const mapAssetStatusToId = (status: AssetStatus): number => {
    const statusMap: Record<AssetStatus, string> = {
      "DISPONÍVEL": 'disponivel',
      "ALUGADO": 'alugado',
      "ASSINATURA": 'assinatura',
      "SEM DADOS": 'sem dados',
      "BLOQUEADO": 'bloqueado',
      "MANUTENÇÃO": 'em manutenção',
      "extraviado": 'extraviado'
    };
    
    const found = statusRecords.find(s => s.nome.toLowerCase() === statusMap[status].toLowerCase());
    return found ? found.id : 1; // Default to 'Disponível' (id=1) if not found
  };

  // Load assets and clients when status records are available
  useEffect(() => {
    const loadData = async () => {
      if (statusRecords.length === 0) return; // Wait for status records
      
      setLoading(true);
      
      try {
        // Fetch assets from the API
        const assetsData = await assetService.getAssets();
        setAssets(assetsData);
        
        // Fetch clients from the database
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .is('deleted_at', null);
          
        if (clientsError) {
          console.error('Error loading clients:', clientsError);
          toast.error('Failed to load clients');
          return;
        }
        
        // Map clients data to our format
        const mappedClients: Client[] = clientsData.map(client => ({
          id: client.uuid,
          name: client.nome,
          document: client.cnpj,
          documentType: client.cnpj.length === 11 ? "CPF" : "CNPJ",
          contact: client.contato?.toString() || "",
          email: client.email || "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          assets: []
        }));
        
        setClients(mappedClients);
      } catch (error) {
        console.error('Error loading assets or clients:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (statusRecords.length > 0) {
      loadData();
    }
  }, [statusRecords]);

  const addAsset = async (assetData: Omit<Asset, "id" | "status">): Promise<Asset | null> => {
    try {
      // Prepare create params
      const createParams = {
        type: assetData.type,
        statusId: assetData.statusId || 1// Default to 'Disponível'
      } as any;

      if (assetData.type === "CHIP") {
        const chipData = assetData as Omit<ChipAsset, "id" | "status">;
        createParams.iccid = chipData.iccid;
        createParams.phoneNumber = chipData.phoneNumber;
        createParams.carrier = chipData.carrier;
      } else if (assetData.type === "ROTEADOR") {
        const routerData = assetData as Omit<RouterAsset, "id" | "status">;
        createParams.brand = routerData.brand;
        createParams.model = routerData.model;
        createParams.password = routerData.password;
        createParams.serialNumber = routerData.serialNumber;
      }
      
      // Create the asset using the API service
      const newAsset = await assetService.createAsset(createParams);
      
      if (newAsset) {
        // Update state
        setAssets(prevAssets => [...prevAssets, newAsset]);
        return newAsset;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error('Failed to add asset');
      return null;
    }
  };

  const updateAsset = async (id: string, assetData: Partial<Asset>): Promise<Asset | null> => {
    try {
      let statusId = assetData.statusId;
      
      // Convert status to status_id if status is being updated
      if (assetData.status && !statusId) {
        statusId = mapAssetStatusToId(assetData.status);
      } else if (statusId) {
        // Map the statusId back to a status name for the UI
        const statusRecord = statusRecords.find(s => s.id === statusId);
        if (statusRecord) {
          assetData.status = mapStatusIdToAssetStatus(statusId);
        }
      }
      
      // Prepare update params
      const updateParams = {
        ...assetData,
        statusId
      };
      
      // Update the asset using the API service
      const updatedAsset = await assetService.updateAsset(id, updateParams);
      
      if (updatedAsset) {
        // Update state
        const updatedAssets = assetActions.updateAssetInList(assets, id, updatedAsset);
        setAssets(updatedAssets);
        return updatedAsset;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating asset:', error);
      toast.error('Failed to update asset');
      return null;
    }
  };

  const deleteAsset = async (id: string): Promise<boolean> => {
    try {
      const asset = assets.find(a => a.id === id);
      
      if (!asset) {
        toast.error('Asset not found');
        return false;
      }
      
      // Delete the asset using the API service
      const success = await assetService.deleteAsset(id);
      
      if (success) {
        // Update state
        setAssets(assets.filter(a => a.id !== id));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset');
      return false;
    }
  };

  const getAssetById = (id: string) => {
    return assetActions.getAssetById(assets, id);
  };

  // NEW IMPLEMENTATION: Asset-Client Association Functions
  const associateAssetToClient = async (assetId: string, clientId: string): Promise<void> => {
    try {
      console.log(`Associating asset ${assetId} to client ${clientId}`);
      
      // Get current date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Get a default plan ID (this was missing in the original implementation)
      const { data: defaultPlan } = await supabase
        .from('plans')
        .select('id')
        .limit(1)
        .single();
        
      const planId = defaultPlan?.id || 1; // Fallback to ID 1 if no plans exist
      
      // Insert association record with required plan_id
      const { error } = await supabase
        .from('asset_client_assoc')
        .insert({
          asset_id: assetId,
          client_id: clientId,
          entry_date: currentDate,
          exit_date: null,
          association_id: 1, // Default to rental
          plan_id: planId // Add the required plan_id
        });
        
      if (error) {
        console.error('Error associating asset to client:', error);
        throw new Error(`Association failed: ${error.message}`);
      }
      
      // Update asset status in local state
      const updatedAssets = assets.map(asset => {
        if (asset.id === assetId) {
          // Ensure we maintain the correct AssetStatus type
          const newAsset = {
            ...asset,
            statusId: 2, // ALUGADO
            clientId: clientId
          };
          
          // Set the status as an AssetStatus enum value
          newAsset.status = "ALUGADO";
          
          return newAsset;
        }
        return asset;
      });
      
      setAssets(updatedAssets);
      toast.success('Asset associated to client successfully');
    } catch (error) {
      console.error('Error in associateAssetToClient:', error);
      toast.error(`Failed to associate asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const removeAssetFromClient = async (assetId: string, clientId: string): Promise<void> => {
    try {
      console.log(`Removing association of asset ${assetId} from client ${clientId}`);
      
      // Get current date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Update the existing association with an exit date
      const { error } = await supabase
        .from('asset_client_assoc')
        .update({
          exit_date: currentDate
        })
        .eq('asset_id', assetId)
        .eq('client_id', clientId)
        .is('exit_date', null);
        
      if (error) {
        console.error('Error removing asset association:', error);
        throw new Error(`Removal failed: ${error.message}`);
      }
      
      // Update asset status in local state
      const updatedAssets = assets.map(asset => {
        if (asset.id === assetId) {
          // Ensure we maintain the correct AssetStatus type
          const newAsset = {
            ...asset,
            statusId: 1, // DISPONÍVEL
            clientId: undefined
          };
          
          // Set the status as an AssetStatus enum value
          newAsset.status = "DISPONÍVEL";
          
          return newAsset;
        }
        return asset;
      });
      
      setAssets(updatedAssets);
      toast.success('Asset removed from client successfully');
    } catch (error) {
      console.error('Error in removeAssetFromClient:', error);
      toast.error(`Failed to remove asset association: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const filterAssets = (criteria: any) => {
    let filteredAssets = [...assets];
    
    // Implement filtering logic if needed
    if (criteria.type) {
      filteredAssets = assetActions.getAssetsByType(filteredAssets, criteria.type);
    }
    
    if (criteria.status) {
      filteredAssets = assetActions.getAssetsByStatus(filteredAssets, criteria.status);
    }
    
    return filteredAssets;
  };

  // Client-related functions
  const getClientById = (id: string) => {
    return clients.find(client => client.id === id);
  };

  // History-related functions
  const addHistoryEntry = (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => {
    const newEntry: AssetHistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...entry
    };
    
    // Log the entry to the database
    (async () => {
      try {
        console.log('Adding history entry:', newEntry);
        
        // Format the entry for the asset_logs table
        const { error } = await supabase
          .from('asset_logs')
          .insert({
            event: newEntry.operationType,
            date: newEntry.timestamp,
            details: {
              description: newEntry.description || newEntry.operationType,
              assets: newEntry.assets,
              client_id: newEntry.clientId,
              client_name: newEntry.clientName,
              comments: newEntry.comments
            }
          });
          
        if (error) {
          console.error('Error logging history entry:', error);
        }
      } catch (err) {
        console.error('Error in history logging:', err);
      }
    })();
    
    // Update local state
    setHistory(prev => [newEntry, ...prev]);
  };

  const getAssetHistory = (assetId: string): AssetHistoryEntry[] => {
    return history.filter(entry => entry.assetIds.includes(assetId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };
  
  const getClientHistory = (clientId: string): AssetHistoryEntry[] => {
    return history.filter(entry => entry.clientId === clientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getExpiredSubscriptions = () => {
    const today = new Date();
    return assets.filter(asset => 
      asset.subscription && 
      asset.subscription.endDate && 
      new Date(asset.subscription.endDate) < today
    );
  };

  const returnAssetsToStock = async (assetIds: string[]) => {
    for (const assetId of assetIds) {
      const asset = getAssetById(assetId);
      if (asset && asset.clientId) {
        await removeAssetFromClient(assetId, asset.clientId);
      }
    }
  };

  const extendSubscription = (assetId: string, newEndDate: string) => {
    const updatedAssets = assets.map(asset => {
      if (asset.id === assetId && asset.subscription) {
        return {
          ...asset,
          subscription: {
            ...asset.subscription,
            endDate: newEndDate
          }
        };
      }
      return asset;
    });
    
    setAssets(updatedAssets);
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
        filterAssets,
        getAssetsByStatus: (status) => assets.filter(asset => asset.status === status),
        getAssetsByType: (type) => assets.filter(asset => asset.type === type),
        addClient: () => {}, // Implement as needed
        updateClient: () => {}, // Implement as needed
        deleteClient: () => {}, // Implement as needed
        getClientById,
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
