
import { Asset, Client } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { 
  useAssetClientAssociation, 
  useAssetInventoryOperations, 
  useSubscriptionOperations 
} from './client';

export const useAssetClient = (
  assets: Asset[],
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>,
  clients?: Client[],
  addHistoryEntry?: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void,
  updateClient?: (id: string, clientData: Partial<Client>) => void
) => {
  // Association operations
  const { associateAssetToClient } = useAssetClientAssociation(
    assets, 
    updateAsset, 
    clients, 
    addHistoryEntry
  );
  
  // Inventory operations (remove asset, return to stock)
  const { removeAssetFromClient, returnAssetsToStock } = useAssetInventoryOperations(
    assets, 
    updateAsset, 
    clients, 
    updateClient, 
    addHistoryEntry
  );
  
  // Subscription operations
  const { extendSubscription } = useSubscriptionOperations(
    assets, 
    updateAsset, 
    clients, 
    addHistoryEntry
  );
  
  return {
    associateAssetToClient,
    removeAssetFromClient,
    returnAssetsToStock,
    extendSubscription
  };
};
