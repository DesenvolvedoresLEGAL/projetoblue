
import React from 'react';
import { SelectedAsset } from '@modules/associations/types';
import { AssetSelectionWizard } from './AssetSelectionWizard';

interface AssetSelectionStepProps {
  selectedAssets: SelectedAsset[];
  onAssetsChange: (assets: SelectedAsset[]) => void;
  onComplete: () => void;
  excludeAssociatedToClient?: string;
}

export const AssetSelectionStep: React.FC<AssetSelectionStepProps> = ({
  selectedAssets,
  onAssetsChange,
  onComplete,
  excludeAssociatedToClient
}) => {
  return (
    <div className="w-full">
      <AssetSelectionWizard
        selectedAssets={selectedAssets}
        onAssetsChange={onAssetsChange}
        onComplete={onComplete}
        excludeAssociatedToClient={excludeAssociatedToClient}
      />
    </div>
  );
};
