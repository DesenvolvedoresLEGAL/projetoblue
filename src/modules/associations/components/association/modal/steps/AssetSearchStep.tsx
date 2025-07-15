
import React from 'react';
import { UnifiedAssetSearch } from '../../UnifiedAssetSearch';
import { SelectedAsset } from '@modules/associations/types';

interface AssetSearchStepProps {
  selectedAssets: SelectedAsset[];
  onAssetSelected: (asset: SelectedAsset) => void;
  excludeAssociatedToClient?: string;
}

export const AssetSearchStep: React.FC<AssetSearchStepProps> = ({
  selectedAssets,
  onAssetSelected,
  excludeAssociatedToClient
}) => {
  return (
    <div className="h-full overflow-y-auto">
      <UnifiedAssetSearch
        selectedAssets={selectedAssets}
        onAssetSelected={onAssetSelected}
        excludeAssociatedToClient={excludeAssociatedToClient}
      />
    </div>
  );
};
