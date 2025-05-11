
import { Asset, ChipAsset, RouterAsset } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';

export const useSubscriptionOperations = (
  assets: Asset[],
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>,
  clients?: Client[],
  addHistoryEntry?: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  // Skip subscription operations if clients or addHistoryEntry are not provided
  if (!clients || !addHistoryEntry) {
    return {
      getExpiredSubscriptions: () => [] as Asset[],
      extendSubscription: () => {}
    };
  }

  const getAssetById = (id: string) => {
    return assets.find(asset => asset.id === id);
  };

  const getExpiredSubscriptions = () => {
    const today = new Date();
    return assets.filter(asset => {
      if (!asset.subscription) return false;
      
      const endDate = new Date(asset.subscription.endDate);
      return endDate < today;
    });
  };

  const extendSubscription = (assetId: string, newEndDate: string) => {
    const asset = getAssetById(assetId);
    if (!asset?.subscription || !asset.clientId) return;
    
    const client = clients.find(c => c.id === asset.clientId);
    if (!client) return;
    
    updateAsset(assetId, {
      subscription: {
        ...asset.subscription,
        endDate: newEndDate,
        isExpired: false
      }
    });
    
    const assetIdentifier = asset.type === "CHIP" 
      ? (asset as ChipAsset).iccid 
      : (asset as RouterAsset).uniqueId;
      
    addHistoryEntry({
      clientId: asset.clientId,
      clientName: client.name,
      assetIds: [asset.id],
      assets: [{
        id: asset.id,
        type: asset.type,
        identifier: assetIdentifier
      }],
      operationType: "ASSINATURA",
      event: "Extensão de assinatura",
      comments: `Assinatura do ativo ${assetIdentifier} estendida até ${new Date(newEndDate).toLocaleDateString('pt-BR')}`
    });
  };

  return {
    getExpiredSubscriptions,
    extendSubscription
  };
};

// Add missing Client type for typechecking
import { Client } from '@/types/asset';
