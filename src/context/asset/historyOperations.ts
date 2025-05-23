
import { AssetHistoryEntry } from "@/types/assetHistory";

export const createHistoryEntry = (
  clientId: string,
  clientName: string,
  assetIds: string[],
  operationType: "ALUGUEL" | "ASSINATURA" | "ASSOCIATION" | "DISASSOCIATION",
  description: string
): AssetHistoryEntry => {
  return {
    id: Date.now().toString(), // Convert to string to match interface
    timestamp: new Date().toISOString(),
    clientId,
    clientName,
    assetIds,
    operationType,
    description,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};
