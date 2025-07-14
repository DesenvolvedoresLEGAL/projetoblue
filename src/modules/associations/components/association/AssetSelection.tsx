
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, ArrowRight, AlertTriangle, Info } from 'lucide-react';
import { ResponsiveAssetModal } from './modal/ResponsiveAssetModal';
import { SelectedAssetsGrid } from './SelectedAssetsGrid';
import { AssociationGeneralConfigComponent } from './AssociationGeneralConfig';
import { SelectedAsset } from '@modules/associations/types';
import { useAssetBusinessRules } from '@modules/associations/hooks/useAssetBusinessRules';

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
  const { validateSelection } = useAssetBusinessRules(selectedAssets);
  const validation = validateSelection;

  // Debug logging
  console.log('AssetSelection - Selected Assets:', selectedAssets);
  console.log('AssetSelection - Validation Result:', validation);

  const handleAssetSelected = useCallback((asset: SelectedAsset) => {
    console.log('AssetSelection - Asset Selected:', asset);
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
  }, [multipleSelection, onAssetAdded, onAssetsChange, selectedAssets]);

  const handleAssetRemoved = useCallback((assetId: string) => {
    console.log('AssetSelection - Asset Removed:', assetId);
    if (onAssetRemoved) {
      onAssetRemoved(assetId);
    } else if (onAssetsChange) {
      onAssetsChange(selectedAssets.filter(a => a.uuid !== assetId));
    }
  }, [onAssetRemoved, onAssetsChange, selectedAssets]);

  const handleAssetUpdated = useCallback((updatedAsset: SelectedAsset) => {
    console.log('=== RECEBENDO DADOS DO AssetConfigurationForm ===');
    console.log('Asset completo recebido:', updatedAsset);
    console.log('UUID do asset:', updatedAsset.uuid);
    console.log('Tipo do asset:', updatedAsset.type);

    // Verificar se o asset existe na lista atual
    const existingAssetIndex = selectedAssets.findIndex(a => a.uuid === updatedAsset.uuid);

    if (existingAssetIndex === -1) {
      console.error('Asset não encontrado na lista atual:', updatedAsset.uuid);
      return;
    }

    console.log('Asset encontrado no índice:', existingAssetIndex);

    // Mesclar dados existentes com os novos dados
    const currentAsset = selectedAssets[existingAssetIndex];
    const mergedAsset: SelectedAsset = {
      ...currentAsset,
      ...updatedAsset,
      // Garantir que propriedades críticas não sejam perdidas
      uuid: currentAsset.uuid,
      type: currentAsset.type,
      // Manter dados de configuração se existirem
      ...(updatedAsset.associatedChip && { associatedChip: updatedAsset.associatedChip }),
      ...(updatedAsset.configuration && { configuration: updatedAsset.configuration }),
      ...(updatedAsset.customFields && { customFields: updatedAsset.customFields }),
      // Timestamp de última atualização
      lastUpdated: new Date().toISOString()
    };

    console.log('Asset mesclado:', mergedAsset);

    // Propagação usando callback apropriado
    if (onAssetUpdated) {
      // Preparar updates sem modificar o objeto original
      const updates = { ...mergedAsset };
      delete updates.uuid; // Remover uuid apenas para o callback

      console.log('Propagando via onAssetUpdated - UUID:', mergedAsset.uuid);
      console.log('Updates enviados:', updates);

      onAssetUpdated(mergedAsset.uuid, updates);
    } else if (onAssetsChange) {
      // Criar nova lista com asset atualizado
      const updatedAssets = selectedAssets.map(asset =>
        asset.uuid === mergedAsset.uuid ? mergedAsset : asset
      );

      console.log('Propagando via onAssetsChange');
      console.log('Lista atualizada:', updatedAssets.map(a => ({
        uuid: a.uuid,
        type: a.type,
        hasChip: !!a.associatedChip,
        hasConfig: !!a.configuration
      })));

      onAssetsChange(updatedAssets);
    }

    console.log('=== PROPAGAÇÃO DE DADOS CONCLUÍDA ===');
  }, [selectedAssets, onAssetUpdated, onAssetsChange]);

  // Função para lidar com atualização de chips especificamente
  const handleChipAssociation = useCallback((assetId: string, chipData: any, isPrincipal: boolean) => {
    console.log('=== ASSOCIAÇÃO DE CHIP ===');
    console.log('Asset ID:', assetId);
    console.log('Chip Data:', chipData);
    console.log('Is Principal:', isPrincipal);

    const assetIndex = selectedAssets.findIndex(a => a.uuid === assetId);
    if (assetIndex === -1) {
      console.error('Asset não encontrado para associação de chip:', assetId);
      return;
    }

    const updatedAsset: SelectedAsset = {
      ...selectedAssets[assetIndex],
      associatedChip: {
        ...chipData,
        isPrincipalChip: isPrincipal
      },
      lastUpdated: new Date().toISOString()
    };

    handleAssetUpdated(updatedAsset);
  }, [selectedAssets, handleAssetUpdated]);

  // Função para lidar com remoção de chips
  const handleChipRemoval = useCallback((assetId: string) => {
    console.log('=== REMOÇÃO DE CHIP ===');
    console.log('Asset ID:', assetId);

    const assetIndex = selectedAssets.findIndex(a => a.uuid === assetId);
    if (assetIndex === -1) {
      console.error('Asset não encontrado para remoção de chip:', assetId);
      return;
    }

    const updatedAsset: SelectedAsset = {
      ...selectedAssets[assetIndex],
      associatedChip: undefined,
      lastUpdated: new Date().toISOString()
    };

    handleAssetUpdated(updatedAsset);
  }, [selectedAssets, handleAssetUpdated]);

  return (
    <div className="space-y-6">
      {/* Configuração Geral (apenas se fornecida) */}
      {generalConfig && onGeneralConfigUpdate && (
        <AssociationGeneralConfigComponent
          config={generalConfig}
          onUpdate={onGeneralConfigUpdate}
        />
      )}

      {/* Validação e Alertas */}
      {selectedAssets.length > 0 && (
        <div className="space-y-2">
          {validation.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validation.warnings.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validation.suggestions.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Sugestões:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validation.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Ativos Selecionados */}
      <Card className="border-[#4D2BFB]/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Ativos Selecionados ({selectedAssets.length})
              {!validation.isValid && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
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
              onChipAssociation={handleChipAssociation}
              onChipRemoval={handleChipRemoval}
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
        onConfirm={() => setShowAssetModal(false)}
      />

      {/* Botão de Prosseguir */}
      {onProceed && selectedAssets.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={onProceed}
            disabled={!validation.isValid}
            className="bg-[#4D2BFB] hover:bg-[#4D2BFB]/90 text-white disabled:opacity-50"
          >
            Prosseguir
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Informação sobre bloqueio */}
      {onProceed && selectedAssets.length > 0 && !validation.isValid && (
        <div className="text-center">
          <p className="text-sm text-red-600">
            Corrija os problemas acima para continuar
          </p>
        </div>
      )}

      {/* Debug Info - Remover em produção */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>Total Assets: {selectedAssets.length}</p>
              <p>Assets with Chips: {selectedAssets.filter(a => a.associatedChip).length}</p>
              <p>Assets with Config: {selectedAssets.filter(a => a.configuration).length}</p>
              <p>Validation Valid: {validation.isValid ? 'Yes' : 'No'}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
