
import { Asset, AssetStatus, AssetType, Client, StatusRecord } from "@/types/asset";
import { AssetHistoryEntry } from "@/types/assetHistory";

export interface AssetContextType {
  assets: Asset[];
  clients: Client[];
  history: AssetHistoryEntry[];
  loading: boolean;
  statusRecords: StatusRecord[];
  addAsset: (assetData: Omit<Asset, "id" | "status">) => Promise<Asset | null>;
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>;
  deleteAsset: (id: string) => Promise<boolean>;
  getAssetById: (id: string) => Asset | undefined;
  getAssetsByStatus: (status: AssetStatus) => Asset[];
  getAssetsByType: (type: AssetType) => Asset[];
  filterAssets?: (criteria: any) => Asset[];
  addClient: (client: Omit<Client, "id">) => void;
  updateClient: (id: string, clientData: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  associateAssetToClient: (assetId: string, clientId: string) => void;
  removeAssetFromClient: (assetId: string, clientId: string) => void;
  getExpiredSubscriptions: () => Asset[];
  returnAssetsToStock: (assetIds: string[]) => void;
  extendSubscription: (assetId: string, newEndDate: string) => void;
  addHistoryEntry: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void;
  getAssetHistory: (assetId: string) => AssetHistoryEntry[];
  getClientHistory: (clientId: string) => AssetHistoryEntry[];
  loadMoreAssets?: () => Promise<void>; // Nova função para carregar mais ativos sob demanda
}
