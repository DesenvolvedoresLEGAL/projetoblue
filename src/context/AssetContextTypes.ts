
import { Asset, AssetStatus, Client, AssetType, SubscriptionInfo } from "@/types/asset";
import { AssetHistoryEntry } from "@/types/assetHistory";

export interface AssetContextType {
  assets: Asset[];
  clients: Client[];
  history: AssetHistoryEntry[];
  loading: boolean;  // Added missing loading property
  addAsset: (asset: Omit<Asset, "id" | "status">) => Promise<Asset | null>;
  updateAsset: (id: string, asset: Partial<Asset>) => Promise<Asset | null>;
  deleteAsset: (id: string) => Promise<boolean>;
  getAssetById: (id: string) => Asset | undefined;
  getAssetsByStatus: (status: AssetStatus) => Asset[];
  getAssetsByType: (type: AssetType) => Asset[];
  addClient: (client: Omit<Client, "id" | "assets">) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  associateAssetToClient: (assetId: string, clientId: string, subscription?: SubscriptionInfo) => void;
  removeAssetFromClient: (assetId: string, clientId: string) => void;
  getExpiredSubscriptions: () => Asset[];
  returnAssetsToStock: (assetIds: string[]) => void;
  extendSubscription: (assetId: string, newEndDate: string) => void;
  addHistoryEntry: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void;
  getAssetHistory: (assetId: string) => AssetHistoryEntry[];
  getClientHistory: (clientId: string) => AssetHistoryEntry[];
  filterAssets?: (criteria: any) => Asset[];  // Added optional filterAssets method
}
