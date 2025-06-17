
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Asset } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';
import { showFriendlyError } from '@/utils/errorTranslator';
import { mapDatabaseAssetToFrontend } from '@/utils/databaseMappers';

interface AssetContextProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  clients: any[]; // Add clients array
  history: any[]; // Add history array
  loading: boolean; // Add loading state
  statusRecords: any[]; // Add status records
  fetchAssets: () => Promise<void>;
  createAsset: (assetData: Omit<Asset, 'id'>) => Promise<Asset | null>;
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>;
  deleteAsset: (id: string) => Promise<boolean>;
  // Add missing methods
  getAssetById: (id: string) => Asset | undefined;
  getAssetsByStatus: (status: string) => Asset[];
  getAssetsByType: (type: string) => Asset[];
  getClientById: (id: string) => any;
  getClientHistory: (clientId: string) => any[];
  getAssetHistory: (assetId: string) => any[];
  associateAssetToClient: (assetId: string, clientId: string) => Promise<void>;
  removeAssetFromClient: (assetId: string, clientId: string) => Promise<void>;
  addHistoryEntry: (entry: any) => void;
  getExpiredSubscriptions: () => Asset[];
  returnAssetsToStock: (assetIds: string[]) => void;
  extendSubscription: (assetId: string, newEndDate: string) => void;
}

export const AssetContext = createContext<AssetContextProps | undefined>(undefined);

interface AssetProviderProps {
  children: React.ReactNode;
}

export const AssetProvider: React.FC<AssetProviderProps> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusRecords, setStatusRecords] = useState<any[]>([]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          asset_status:status_id (
            id,
            status
          ),
          asset_solutions:solution_id (
            id,
            solution
          ),
          manufacturers:manufacturer_id (
            id,
            name
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database data to frontend Asset format
      const transformedAssets = (data || []).map(mapDatabaseAssetToFrontend).filter(Boolean);
      setAssets(transformedAssets);
    } catch (error) {
      console.error('Erro ao buscar ativos:', error);
      showFriendlyError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    // Also fetch clients and other data
    fetchClients();
    fetchStatusRecords();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .is('deleted_at', null);
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const fetchStatusRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('asset_status')
        .select('*')
        .is('deleted_at', null);
      
      if (error) throw error;
      setStatusRecords(data || []);
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    }
  };

  const createAsset = async (assetData: Omit<Asset, 'id'>): Promise<Asset | null> => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert([assetData])
        .select(`
          *,
          asset_status:status_id (
            id,
            status
          ),
          asset_solutions:solution_id (
            id,
            solution
          ),
          manufacturers:manufacturer_id (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;

      const transformedAsset = mapDatabaseAssetToFrontend(data);
      if (transformedAsset) {
        setAssets(prev => [...prev, transformedAsset]);
        toast.success('Ativo criado com sucesso!');
        return transformedAsset;
      }
      return null;
    } catch (error) {
      console.error('Erro ao criar ativo:', error);
      showFriendlyError(error);
      return null;
    }
  };

  const updateAsset = async (id: string, assetData: Partial<Asset>): Promise<Asset | null> => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .update(assetData)
        .eq('uuid', id)
        .select(`
          *,
          asset_status:status_id (
            id,
            status
          ),
          asset_solutions:solution_id (
            id,
            solution
          ),
          manufacturers:manufacturer_id (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;

      const transformedAsset = mapDatabaseAssetToFrontend(data);
      if (transformedAsset) {
        setAssets(prev => prev.map(asset => 
          asset.id === id ? transformedAsset : asset
        ));
        toast.success('Ativo atualizado com sucesso!');
        return transformedAsset;
      }
      return null;
    } catch (error) {
      console.error('Erro ao atualizar ativo:', error);
      showFriendlyError(error);
      return null;
    }
  };

  const deleteAsset = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('assets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('uuid', id);

      if (error) throw error;

      setAssets(prev => prev.filter(asset => asset.id !== id));
      toast.success('Ativo removido com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao remover ativo:', error);
      if (error?.message?.includes('foreign key constraint')) {
        showFriendlyError(null, 'Não foi possível excluir este ativo pois ele está vinculado a outros registros.');
      } else {
        showFriendlyError(error);
      }
      return false;
    }
  };

  // Helper methods
  const getAssetById = (id: string) => assets.find(asset => asset.id === id);
  const getAssetsByStatus = (status: string) => assets.filter(asset => asset.status === status);
  const getAssetsByType = (type: string) => assets.filter(asset => asset.type === type);
  const getClientById = (id: string) => clients.find(client => client.uuid === id);
  const getClientHistory = (clientId: string) => history.filter(h => h.clientId === clientId);
  const getAssetHistory = (assetId: string) => history.filter(h => h.assetIds?.includes(assetId));
  
  const associateAssetToClient = async (assetId: string, clientId: string) => {
    // Implementation for asset association
    console.log('Associating asset to client:', assetId, clientId);
  };
  
  const removeAssetFromClient = async (assetId: string, clientId: string) => {
    // Implementation for removing asset association
    console.log('Removing asset from client:', assetId, clientId);
  };
  
  const addHistoryEntry = (entry: any) => {
    setHistory(prev => [...prev, { ...entry, id: Date.now().toString() }]);
  };
  
  const getExpiredSubscriptions = () => {
    const today = new Date();
    return assets.filter(asset => 
      asset.subscription?.endDate && new Date(asset.subscription.endDate) < today
    );
  };
  
  const returnAssetsToStock = (assetIds: string[]) => {
    // Implementation for returning assets to stock
    console.log('Returning assets to stock:', assetIds);
  };
  
  const extendSubscription = (assetId: string, newEndDate: string) => {
    // Implementation for extending subscription
    console.log('Extending subscription:', assetId, newEndDate);
  };

  const value: AssetContextProps = {
    assets,
    setAssets,
    clients,
    history,
    loading,
    statusRecords,
    fetchAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    getAssetById,
    getAssetsByStatus,
    getAssetsByType,
    getClientById,
    getClientHistory,
    getAssetHistory,
    associateAssetToClient,
    removeAssetFromClient,
    addHistoryEntry,
    getExpiredSubscriptions,
    returnAssetsToStock,
    extendSubscription,
  };

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  );
};

export const useAssets = (): AssetContextProps => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
};
