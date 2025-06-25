import { createContext, useContext } from 'react';
import { Asset, Client, StatusRecord } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import type { AssetCreateParams, AssetUpdateParams } from '@/modules/assets/services/asset/types';

export interface AssetContextProps {
  assets: Asset[];
  clients: Client[];
  history: AssetHistoryEntry[];
  statusRecords: StatusRecord[];
  loading: boolean;
  error: string | null;
  createAsset: (assetData: AssetCreateParams) => Promise<void>;
  updateAsset: (id: string, updates: AssetUpdateParams) => Promise<Asset>;
  deleteAsset: (id: string) => Promise<boolean>;
  getAssetById: (id: string) => Asset | undefined;
  getAssetsByStatus: (status: string) => Asset[];
  getAssetsByType: (type: string) => Asset[];
  getClientById: (id: string) => Client | undefined;
  associateAssetToClient: (assetId: string, clientId: string) => Promise<void>;
  removeAssetFromClient: (assetId: string, clientId: string) => Promise<void>;
  addHistoryEntry: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void;
  getAssetHistory: (assetId: string) => AssetHistoryEntry[];
  getClientHistory: (clientId: string) => AssetHistoryEntry[];
  getExpiredSubscriptions: () => Asset[];
  returnAssetsToStock: (assetIds: string[]) => void;
  extendSubscription: (assetId: string, newEndDate: string) => void;
}

export const AssetContext = createContext<AssetContextProps | undefined>(undefined);

export const useAssets = (): AssetContextProps => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
};
