
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight } from 'lucide-react';
import { ResponsiveAssetModal } from './modal/ResponsiveAssetModal';
import { SelectedAssetsGrid } from './SelectedAssetsGrid';
import { AssociationGeneralConfigComponent } from './AssociationGeneralConfig';
import { SelectedAsset } from '@modules/associations/types';

// Import the type separately to avoid naming conflicts
import type { AssociationGeneralConfig } from './AssociationGeneralConfig';

export interface AssetSelectionProps {
  selectedAssets: SelectedAsset[];
  generalConfig?: AssociationGeneralConfig;
  onAssetAdded?: (asset: SelectedAsset) => void;
  onAssetRemoved?: (assetId: string) => void;
  onAssetUpdated?: (assetId: string, updates: Partial<SelectedAsset>) => void;
  onGeneralConfigUpdate?: (updates: Partial<AssociationGeneralConfig>) => void;
  onProceed?: () => void;
  onAssetsChange?: (assets: SelectedAsset[]) => void;
  multipleSelection?: boolean;
  excludeAssociatedToClient?: string;
}

export const AssetSelection: React.FC<AssetSelectionProps> = ({
  selectedAssets,
  generalConfig,
  onAssetAdded,
  onAssetRemoved,
  onAssetUpdated,
  onGeneralConfigUpdate,
  onProceed,
  onAssetsChange,
  multipleSelection = true,
  excludeAssociatedToClient
}) => {
  const [showAssetModal, setShowAssetModal] = useState(false);

  const handleAssetSelected = (asset: SelectedAsset) => {
    if (multipleSelection) {
      if (onAssetAdded) {
        onAssetAdded(asset);
      } else if (onAssetsChange) {
        onAssetsChange([...selectedAssets, asset]);
      }
    } else {
      if (onAssetsChange) {
        onAssetsChange([asset]);
      }
    }
  };

  const handleAssetRemoved = (assetId: string) => {
    if (onAssetRemoved) {
      onAssetRemoved(assetId);
    } else if (onAssetsChange) {
      onAssetsChange(selectedAssets.filter(a => a.uuid !== assetId));
    }
  };

  const handleAssetUpdated = (asset: SelectedAsset) => {
    if (onAssetUpdated) {
      const { uuid, ...updates } = asset;
      onAssetUpdated(uuid, updates);
    } else if (onAssetsChange) {
      onAssetsChange(selectedAssets.map(a => a.uuid === asset.uuid ? asset : a));
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuração Geral (apenas se fornecida) */}
      {generalConfig && onGeneralConfigUpdate && (
        <AssociationGeneralConfigComponent
          config={generalConfig}
          onUpdate={onGeneralConfigUpdate}
        />
      )}

      {/* Ativos Selecionados */}
      <Card className="border-[#4D2BFB]/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Ativos Selecionados ({selectedAssets.length})
            </CardTitle>
            <Button
              onClick={() => setShowAssetModal(true)}
              className="bg-[#4D2BFB] hover:bg-[#4D2BFB]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Ativo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedAssets.length > 0 ? (
            <SelectedAssetsGrid
              assets={selectedAssets}
              onRemoveAsset={handleAssetRemoved}
              onEditAsset={handleAssetUpdated}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum ativo selecionado</p>
              <p className="text-sm">Clique em "Adicionar Ativo" para começar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Responsivo para Busca de Ativos */}
      <ResponsiveAssetModal
        open={showAssetModal}
        onOpenChange={setShowAssetModal}
        title="Selecionar Ativos"
        description="Busque e selecione os ativos que deseja associar"
        selectedAssets={selectedAssets}
        onAssetSelected={handleAssetSelected}
        onAssetRemoved={handleAssetRemoved}
        excludeAssociatedToClient={excludeAssociatedToClient}
        multipleSelection={multipleSelection}
        onCancel={() => setShowAssetModal(false)}
      />

      {/* Botão de Prosseguir (apenas se fornecido) */}
      {onProceed && selectedAssets.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={onProceed}
            className="bg-[#4D2BFB] hover:bg-[#4D2BFB]/90 text-white"
          >
            Prosseguir
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};
