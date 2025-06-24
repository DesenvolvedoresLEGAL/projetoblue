
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight } from 'lucide-react';
import { UnifiedAssetSearch } from './UnifiedAssetSearch';
import { SelectedAssetsGrid } from './SelectedAssetsGrid';
import { AssociationGeneralConfig as AssociationGeneralConfigComponent } from './AssociationGeneralConfig';
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
  const [showAssetSearch, setShowAssetSearch] = useState(false);

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
    setShowAssetSearch(false);
  };

  const handleAssetRemoved = (assetId: string) => {
    if (onAssetRemoved) {
      onAssetRemoved(assetId);
    } else if (onAssetsChange) {
      onAssetsChange(selectedAssets.filter(a => a.uuid !== assetId));
    }
  };

  const handleAssetUpdated = (assetId: string, updates: Partial<SelectedAsset>) => {
    if (onAssetUpdated) {
      onAssetUpdated(assetId, updates);
    } else if (onAssetsChange) {
      onAssetsChange(selectedAssets.map(a => a.uuid === assetId ? { ...a, ...updates } : a));
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
              onClick={() => setShowAssetSearch(true)}
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

      {/* Busca de Ativos */}
      {showAssetSearch && (
        <Card className="border-[#4D2BFB]/20">
          <CardHeader>
            <CardTitle>Buscar e Selecionar Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <UnifiedAssetSearch
              selectedAssets={selectedAssets}
              onAssetSelected={handleAssetSelected}
              excludeAssociatedToClient={excludeAssociatedToClient}
            />
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAssetSearch(false)}
              >
                Fechar Busca
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
