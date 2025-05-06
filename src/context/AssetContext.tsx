
import React, { createContext, useState, useEffect } from "react";
import { Asset, AssetStatus, Client, AssetType, SubscriptionInfo } from "@/types/asset";
import { AssetContextType } from "./AssetContextTypes";
import { AssetHistoryEntry } from "@/types/assetHistory";
import { toast } from "@/utils/toast";
import { v4 as uuidv4 } from "uuid";
import { 
  getAssetById, 
  getAssetsByStatus, 
  getAssetsByType, 
  createAsset, 
  updateAssetInList 
} from "./assetActions";
import { 
  getClientById, 
  createClient, 
  updateClientInList 
} from "./clientActions";
import {
  returnAssetsToStock,
  associateAssetToClient,
  removeAssetFromClient,
  extendSubscription
} from "./asset/assetOperations";
import {
  addHistoryEntry as addHistoryEntryAction,
  getAssetHistory as getAssetHistoryAction,
  getClientHistory as getClientHistoryAction
} from "./asset/historyOperations";

export const AssetContext = createContext<AssetContextType | undefined>(undefined);

export { useAssets } from "./useAssets";

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>(() => {
    const savedAssets = localStorage.getItem("assets");
    return savedAssets ? JSON.parse(savedAssets) : [];
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const savedClients = localStorage.getItem("clients");
    return savedClients ? JSON.parse(savedClients) : [];
  });

  const [history, setHistory] = useState<AssetHistoryEntry[]>(() => {
    const savedHistory = localStorage.getItem("assetHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  useEffect(() => {
    localStorage.setItem("assets", JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem("clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("assetHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const currentDate = new Date().toISOString();
    const updatedAssets = assets.map(asset => {
      if (asset.subscription && asset.subscription.endDate < currentDate && !asset.subscription.isExpired) {
        return {
          ...asset,
          subscription: {
            ...asset.subscription,
            isExpired: true
          }
        };
      }
      return asset;
    });

    if (JSON.stringify(updatedAssets) !== JSON.stringify(assets)) {
      setAssets(updatedAssets);
    }
  }, [assets]);

  const addAsset = (assetData: Omit<Asset, "id" | "status">) => {
    const newAsset = createAsset(assetData);
    setAssets((prevAssets: Asset[]) => [...prevAssets, newAsset]);
    toast.success("Ativo adicionado com sucesso!");
  };

  const updateAsset = (id: string, assetData: Partial<Asset>) => {
    setAssets((prevAssets: Asset[]) => updateAssetInList(prevAssets, id, assetData));
    toast.success("Ativo atualizado com sucesso!");
  };

  const deleteAsset = (id: string) => {
    setAssets((prevAssets: Asset[]) => prevAssets.filter(asset => asset.id !== id));
    
    setClients((prevClients: Client[]) => prevClients.map(client => ({
      ...client,
      assets: client.assets.filter(assetId => assetId !== id)
    })));
    
    toast.success("Ativo removido com sucesso!");
  };

  const addClient = (clientData: Omit<Client, "id" | "assets">) => {
    const newClient = createClient(clientData);
    setClients((prevClients: Client[]) => [...prevClients, newClient]);
    toast.success("Cliente adicionado com sucesso!");
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients((prevClients: Client[]) => updateClientInList(prevClients, id, clientData));
    toast.success("Cliente atualizado com sucesso!");
  };

  const deleteClient = (id: string) => {
    const clientToDelete = getClientById(clients, id);
    if (clientToDelete) {
      clientToDelete.assets.forEach(assetId => {
        const asset = getAssetById(assets, assetId);
        if (asset) {
          updateAsset(assetId, { 
            status: "DISPONÍVEL" as AssetStatus, 
            clientId: undefined,
            subscription: undefined
          });
        }
      });
    }
    
    setClients((prevClients: Client[]) => prevClients.filter(client => client.id !== id));
    toast.success("Cliente removido com sucesso!");
  };

  const addHistoryEntry = (entryData: Omit<AssetHistoryEntry, "id" | "timestamp">) => {
    addHistoryEntryAction(setHistory, entryData);
  };

  const getAssetHistory = (assetId: string) => {
    return getAssetHistoryAction(history, assetId);
  };

  const getClientHistory = (clientId: string) => {
    return getClientHistoryAction(history, clientId);
  };

  const getExpiredSubscriptions = () => {
    return assets.filter(asset => 
      asset.subscription?.isExpired === true
    );
  };

  const value = {
    assets,
    clients,
    history,
    addAsset,
    updateAsset,
    deleteAsset,
    getAssetById: (id: string) => getAssetById(assets, id),
    getAssetsByStatus: (status: AssetStatus) => getAssetsByStatus(assets, status),
    getAssetsByType: (type: AssetType) => getAssetsByType(assets, type),
    addClient,
    updateClient,
    deleteClient,
    getClientById: (id: string) => getClientById(clients, id),
    associateAssetToClient: (assetId: string, clientId: string, subscription?: SubscriptionInfo) => 
      associateAssetToClient(assets, clients, assetId, clientId, subscription, updateAsset, updateClient, addHistoryEntry),
    removeAssetFromClient: (assetId: string, clientId: string) => 
      removeAssetFromClient(assets, clients, assetId, clientId, updateAsset, updateClient, addHistoryEntry),
    getExpiredSubscriptions,
    returnAssetsToStock: (assetIds: string[]) => 
      returnAssetsToStock(assets, clients, assetIds, setAssets, setClients, addHistoryEntry),
    extendSubscription: (assetId: string, newEndDate: string) => 
      extendSubscription(assets, clients, assetId, newEndDate, updateAsset, addHistoryEntry),
    addHistoryEntry,
    getAssetHistory,
    getClientHistory,
  };

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
};
