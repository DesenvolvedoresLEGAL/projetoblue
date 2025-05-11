
import { Asset, Client } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { useAssetClientAssociation } from './client/useAssetClientAssociation';
import { useAssetInventoryOperations } from './client/useAssetInventoryOperations';
import { useSubscriptionOperations } from './client/useSubscriptionOperations';

export const useAssetClient = (
  assets: Asset[],
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>,
  clients?: Client[],
  addHistoryEntry?: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  // Use our newly created hooks to handle specific functionality
  const clientAssociation = useAssetClientAssociation(assets, updateAsset, clients, addHistoryEntry);
  const inventoryOperations = useAssetInventoryOperations(assets, updateAsset, clients, addHistoryEntry);
  const subscriptionOperations = useSubscriptionOperations(assets, updateAsset, clients, addHistoryEntry);

  // Combine and return all the operations from our sub-hooks
  return {
    associateAssetToClient: clientAssociation.associateAssetToClient,
    removeAssetFromClient: clientAssociation.removeAssetFromClient,
    returnAssetsToStock: inventoryOperations.returnAssetsToStock,
    getExpiredSubscriptions: subscriptionOperations.getExpiredSubscriptions,
    extendSubscription: subscriptionOperations.extendSubscription
  };
};
