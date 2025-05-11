
import { Asset, AssetStatus, AssetType } from "@/types/asset";
import { ChipAsset, RouterAsset } from "@/types/asset";
import { AssetHistoryEntry } from "@/types/assetHistory";
import { toast } from "@/utils/toast";

export const returnAssetsToStock = (
  assets: Asset[],
  assetIds: string[],
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>,
  addHistoryEntry?: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  // Get the assets that need to be returned to stock
  const assetsToReturn = assets.filter(asset => assetIds.includes(asset.id));
  
  const returnLog: {
    clientId: string;
    clientName: string;
    assets: { id: string; type: AssetType; identifier: string }[];
  }[] = [];

  // Process each asset
  assetsToReturn.forEach(async asset => {
    if (!asset.clientId) return; // Skip if not assigned to a client
    
    const clientId = asset.clientId;
    
    // Store asset info for the history entry
    const assetIdentifier = asset.type === "CHIP" 
      ? (asset as ChipAsset).iccid 
      : (asset as RouterAsset).uniqueId;

    // Add to the return log, grouped by client
    const clientLogIndex = returnLog.findIndex(log => log.clientId === clientId);
    const assetEntry = { 
      id: asset.id, 
      type: asset.type, 
      identifier: assetIdentifier 
    };
    
    if (clientLogIndex >= 0) {
      returnLog[clientLogIndex].assets.push(assetEntry);
    } else {
      returnLog.push({
        clientId,
        clientName: "Cliente", // This will be updated later
        assets: [assetEntry]
      });
    }
    
    // Update the asset status to available and remove client association
    await updateAsset(asset.id, {
      status: "DISPONÍVEL",
      statusId: 1, // Assuming 1 is the ID for "DISPONÍVEL"
      clientId: undefined,
      subscription: undefined
    });
  });
  
  // Create history entries for the returned assets
  if (addHistoryEntry) {
    returnLog.forEach(log => {
      addHistoryEntry({
        clientId: log.clientId,
        clientName: log.clientName,
        assetIds: log.assets.map(a => a.id),
        assets: log.assets,
        operationType: "DISASSOCIATION",
        event: "Retorno ao Estoque",
        comments: `${log.assets.length} ativo(s) retornado(s) ao estoque`
      });
    });
  }
  
  // Show success notification
  const count = assetsToReturn.length;
  toast.success(`${count} ativo${count > 1 ? "s" : ""} retornado${count > 1 ? "s" : ""} ao estoque com sucesso!`);
};
