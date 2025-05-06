
import { Asset, AssetType, Client } from "./asset";

export type OperationType = "ALUGUEL" | "ASSINATURA";

export interface AssetHistoryEntry {
  id: string;
  timestamp: string;
  clientId: string;
  clientName: string;
  assetIds: string[];
  assets: {
    id: string;
    type: AssetType;
    identifier: string; // ICCID for chips, uniqueId for routers
  }[];
  operationType: OperationType;
  event?: string;
  comments?: string;
}
