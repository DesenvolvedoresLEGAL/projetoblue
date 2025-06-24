
import React from 'react';
import { SelectedAsset } from '@modules/associations/types';
import { SearchTabs } from './search/SearchTabs';

interface UnifiedAssetSearchProps {
  selectedAssets: SelectedAsset[];
  onAssetSelected: (asset: SelectedAsset) => void;
  excludeAssociatedToClient?: string;
}

export const UnifiedAssetSearch: React.FC<UnifiedAssetSearchProps> = ({
  selectedAssets,
  onAssetSelected,
  excludeAssociatedToClient
}) => {
  const handleAssetSelect = (asset: SelectedAsset) => {
    console.log('UnifiedAssetSearch: Asset selecionado', asset.uuid);
    // Remover a validação de duplicata daqui - deixar apenas no AddAssetsDialog
    onAssetSelected(asset);
  };

  return (
    <div className="h-full overflow-hidden">
      <SearchTabs
        selectedAssets={selectedAssets}
        onAssetSelected={handleAssetSelect}
        excludeAssociatedToClient={excludeAssociatedToClient}
      />
    </div>
  );
};
