
import { Asset, AssetStatus } from '@/types/asset';
import { useAssetCreate } from './mutations/useAssetCreate';
import { useAssetUpdate } from './mutations/useAssetUpdate';
import { useAssetDelete } from './mutations/useAssetDelete';

export const useAssetMutation = (
  assets: Asset[],
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>,
  mapStatusIdToAssetStatus: (statusId: number) => AssetStatus,
  mapAssetStatusToId: (status: AssetStatus) => number,
  statusRecords: any[]
) => {
  // Use our newly created hooks to handle specific mutation operations
  const { addAsset } = useAssetCreate(assets, setAssets, mapStatusIdToAssetStatus);
  const { updateAsset } = useAssetUpdate(assets, setAssets, mapStatusIdToAssetStatus, statusRecords);
  const { deleteAsset } = useAssetDelete(assets, setAssets);

  // Combine and return all mutation operations
  return {
    addAsset,
    updateAsset,
    deleteAsset
  };
};
