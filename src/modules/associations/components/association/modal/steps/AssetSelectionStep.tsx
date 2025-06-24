
import React from 'react';
import { SelectedAssetsGrid } from '../../SelectedAssetsGrid';
import { SelectedAsset } from '@modules/associations/types';

interface AssetSelectionStepProps {
  selectedAssets: SelectedAsset[];
  onAssetRemoved?: (assetId: string) => void;
  multipleSelection?: boolean;
}

export const AssetSelectionStep: React.FC<AssetSelectionStepProps> = ({
  selectedAssets,
  onAssetRemoved,
  multipleSelection = true
}) => {
  const handleEditAsset = (asset: SelectedAsset) => {
    // Esta funcionalidade pode ser implementada posteriormente se necessário
    console.log('Edit asset:', asset);
  };

  return (
    <div className="h-full overflow-y-auto">
      {selectedAssets.length > 0 ? (
        <SelectedAssetsGrid
          assets={selectedAssets}
          onRemoveAsset={onAssetRemoved || (() => {})}
          onEditAsset={handleEditAsset}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <div className="mb-4 text-4xl">📦</div>
          <h3 className="text-lg font-medium mb-2">Nenhum ativo selecionado</h3>
          <p className="text-sm">
            {multipleSelection 
              ? 'Volte para a busca e selecione os ativos desejados'
              : 'Volte para a busca e selecione um ativo'
            }
          </p>
        </div>
      )}
    </div>
  );
};
