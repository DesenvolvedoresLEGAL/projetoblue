
import { Asset, AssetType, Client } from "./asset";

export type OperationType = "ALUGUEL" | "ASSINATURA" | "ASSOCIATION" | "DISASSOCIATION";

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
  description?: string;
  event?: string;
  comments?: string;
}
