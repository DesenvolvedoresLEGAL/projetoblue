
import React from 'react';
import { SelectedAsset } from '@modules/associations/types';
import { AssetSelection } from './AssetSelection';

interface AssetSelectionWizardProps {
  selectedAssets: SelectedAsset[];
  onAssetsChange: (assets: SelectedAsset[]) => void;
  onComplete: () => void;
  excludeAssociatedToClient?: string;
}

export const AssetSelectionWizard: React.FC<AssetSelectionWizardProps> = ({
  selectedAssets,
  onAssetsChange,
  onComplete,
  excludeAssociatedToClient
}) => {
  return (
    <AssetSelection
      selectedAssets={selectedAssets}
      onAssetsChange={onAssetsChange}
      onProceed={onComplete}
      multipleSelection={true}
      excludeAssociatedToClient={excludeAssociatedToClient}
    />
  );
};
