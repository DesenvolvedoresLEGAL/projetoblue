
import { Asset, AssetStatus, AssetType, Client, StatusRecord } from "@/types/asset";
import { AssetHistoryEntry } from "@/types/assetHistory";

export interface AssetContextType {
  assets: Asset[];
  clients: Client[];
  history: AssetHistoryEntry[];
  loading: boolean;
  error: string | null;
  statusRecords: StatusRecord[];
  createAsset: (assetData: any) => Promise<void>;
  updateAsset: (id: string, assetData: any) => Promise<Asset>;
  deleteAsset: (id: string) => Promise<boolean>;
  getAssetById: (id: string) => Asset | undefined;
  getAssetsByStatus: (status: string) => Asset[];
  getAssetsByType: (type: string) => Asset[];
  getClientById: (id: string) => Client | undefined;
  associateAssetToClient: (assetId: string, clientId: string) => Promise<void>;
  removeAssetFromClient: (assetId: string, clientId: string) => Promise<void>;
  getExpiredSubscriptions: () => Asset[];
  returnAssetsToStock: (assetIds: string[]) => void;
  extendSubscription: (assetId: string, newEndDate: string) => void;
  addHistoryEntry: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void;
  getAssetHistory: (assetId: string) => AssetHistoryEntry[];
  getClientHistory: (clientId: string) => AssetHistoryEntry[];
}
