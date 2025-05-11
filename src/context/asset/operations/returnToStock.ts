
import { Asset, Client } from "@/types/asset";
import { AssetHistoryEntry } from "@/types/assetHistory";
import { toast } from "@/utils/toast";

export const returnAssetsToStock = (
  assetIds: string[],
  assets: Asset[],
  clients: Client[],
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>,
  updateClient: (id: string, clientData: Partial<Client>) => void,
  addHistoryEntry: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  // Group assets by client
  const assetsByClient: { [clientId: string]: Asset[] } = {};
  
  // Process each asset
  assetIds.forEach(assetId => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset || !asset.clientId) return;
    
    // Add to client group
    if (!assetsByClient[asset.clientId]) {
      assetsByClient[asset.clientId] = [];
    }
    assetsByClient[asset.clientId].push(asset);
    
    // Update asset status
    updateAsset(assetId, {
      clientId: undefined,
      status: "DISPONÍVEL"
    });
  });
  
  // Update clients and create history entries
  Object.entries(assetsByClient).forEach(([clientId, clientAssets]) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    // Update client assets list
    updateClient(clientId, {
      assets: (c => {
        const updatedAssets = (c?.assets ?? []).filter(id => !assetIds.includes(id));
        return updatedAssets;
      }) as any
    });
    
    // Create history entry
    addHistoryEntry({
      clientId,
      clientName: client.name,
      assetIds: clientAssets.map(a => a.id),
      assets: clientAssets.map(a => ({
        id: a.id,
        type: a.type,
        identifier: a.type === "CHIP" ? (a as any).iccid : (a as any).uniqueId
      })),
      operationType: "DISASSOCIATION",
      description: `${clientAssets.length} asset(s) returned to stock from ${client.name}`
    });
  });
  
  toast.success(`${assetIds.length} ativo(s) devolvido(s) ao estoque com sucesso`);
};
