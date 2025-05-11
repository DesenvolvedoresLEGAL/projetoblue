
import { Asset, ChipAsset, RouterAsset, Client } from "@/types/asset";
import { AssetHistoryEntry } from "@/types/assetHistory";
import { toast } from "@/utils/toast";
import { getAssetById } from "../../assetActions";
import { getClientById } from "../../clientActions";

export const returnAssetsToStock = (
  assets: Asset[],
  clients: Client[],
  assetIds: string[],
  updateAsset: (id: string, assetData: Partial<Asset>) => void,
  updateClient: (id: string, clientData: Partial<Client>) => void,
  addHistoryEntry: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  if (assetIds.length === 0) return;
  
  // Group assets by client for more efficient processing
  const clientAssetsMap = new Map<string, Asset[]>();
  
  // First pass - group assets by client and check validity
  for (const assetId of assetIds) {
    const asset = getAssetById(assets, assetId);
    if (!asset) continue;
    
    if (!asset.clientId) {
      toast.error(`Ativo ${assetId.substring(0, 8)} não está associado a nenhum cliente.`);
      continue;
    }
    
    // Group by client
    const clientAssets = clientAssetsMap.get(asset.clientId) || [];
    clientAssets.push(asset);
    clientAssetsMap.set(asset.clientId, clientAssets);
  }
  
  // Second pass - process assets by client
  clientAssetsMap.forEach((clientAssets, clientId) => {
    const client = getClientById(clients, clientId);
    if (!client) return;
    
    // Process all assets for this client
    const processedAssetIds: string[] = [];
    const assetEntries: { id: string; type: AssetType; identifier: string }[] = [];
    
    // Update each asset
    clientAssets.forEach(asset => {
      let needsPasswordChange = false;
      
      if (asset.type === "ROTEADOR") {
        needsPasswordChange = true;
        toast.error(`⚠️ O roteador saiu do cliente ${client.name} e retornou ao estoque. Altere o SSID e a senha.`);
      }
      
      updateAsset(asset.id, {
        status: "DISPONÍVEL",
        clientId: undefined,
        subscription: undefined,
        ...(asset.type === "ROTEADOR" ? { needsPasswordChange } : {})
      });
      
      // Track for history entry
      processedAssetIds.push(asset.id);
      
      const assetIdentifier = asset.type === "CHIP" 
        ? (asset as ChipAsset).iccid 
        : (asset as RouterAsset).uniqueId;
        
      assetEntries.push({
        id: asset.id,
        type: asset.type,
        identifier: assetIdentifier
      });
    });
    
    // Update client's asset list
    updateClient(clientId, {
      assets: client.assets.filter(id => !processedAssetIds.includes(id))
    });
    
    // Create history entry for all assets returned for this client
    if (assetEntries.length > 0) {
      addHistoryEntry({
        clientId,
        clientName: client.name,
        assetIds: processedAssetIds,
        assets: assetEntries,
        operationType: clientAssets.some(a => a.status === "ASSINATURA") ? "ASSINATURA" : "ALUGUEL",
        event: "Retorno ao estoque em massa",
        comments: `${assetEntries.length} ativos removidos do cliente ${client.name} e retornaram ao estoque.`
      });
    }
  });
  
  toast.success(`${assetIds.length} ativos retornaram ao estoque com sucesso!`);
};
