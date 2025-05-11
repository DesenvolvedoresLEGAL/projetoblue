
import { Asset, Client } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { extendSubscription } from '../../../operations';

export const useSubscriptionOperations = (
  assets: Asset[],
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>,
  clients?: Client[],
  addHistoryEntry?: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  // Extend subscription
  const extendSubscriptionWrapper = (assetId: string, newEndDate: string) => {
    if (!clients || !addHistoryEntry) return;
    
    extendSubscription(
      assets,
      clients,
      assetId,
      newEndDate,
      updateAsset,
      addHistoryEntry
    );
  };

  return {
    extendSubscription: extendSubscriptionWrapper
  };
};
