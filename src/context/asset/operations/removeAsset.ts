
import { Asset, Client } from "@/types/asset";
import { AssetHistoryEntry } from "@/types/assetHistory";
import { toast } from "@/utils/toast";

export const removeAssetFromClient = (
  assetId: string,
  clientId: string,
  assets: Asset[],
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>,
  updateClient: (id: string, clientData: Partial<Client>) => void,
  addHistoryEntry: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  // Find the asset
  const asset = assets.find(a => a.id === assetId);
  if (!asset || asset.clientId !== clientId) {
    toast.error("Ativo não encontrado ou não associado ao cliente especificado");
    return;
  }

  // Update the asset to remove client association
  updateAsset(assetId, {
    clientId: undefined,
    status: "DISPONÍVEL"
  });

  // Update the client to remove the asset
  updateClient(clientId, {
    assets: (client => {
      const updatedAssets = (client?.assets ?? []).filter(id => id !== assetId);
      return updatedAssets;
    }) as any
  });

  // Create a history entry for this operation
  addHistoryEntry({
    clientId,
    clientName: "",  // Client name should be fetched in the component
    assetIds: [assetId],
    assets: [{
      id: assetId,
      type: asset.type,
      identifier: asset.type === "CHIP" ? (asset as any).iccid : (asset as any).uniqueId
    }],
    operationType: "DISASSOCIATION",
    description: `Asset ${assetId} removed from client ${clientId}`
  });

  toast.success("Ativo removido do cliente com sucesso");
};
