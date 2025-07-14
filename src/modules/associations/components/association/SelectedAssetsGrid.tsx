
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssetCard } from './AssetCard';
import { AssetConfigurationForm } from './AssetConfigurationForm';
import { SelectedAsset } from '@modules/associations/types';
import { Search, Wifi, Smartphone } from 'lucide-react';

interface SelectedAssetsGridProps {
  assets: SelectedAsset[];
  onRemoveAsset: (assetId: string) => void;
  onEditAsset: (asset: SelectedAsset) => void;
  excludeAssociatedToClient?: string;
}

export const SelectedAssetsGrid: React.FC<SelectedAssetsGridProps> = ({
  assets,
  onRemoveAsset,
  onEditAsset,
  excludeAssociatedToClient
}) => {
  const [configurationModal, setConfigurationModal] = useState<{
    open: boolean;
    asset: SelectedAsset | null;
  }>({
    open: false,
    asset: null
  });

  const equipmentCount = assets.filter(asset => asset.type === 'EQUIPMENT').length;
  const chipCount = assets.filter(asset => asset.type === 'CHIP').length;

  const handleConfigureAsset = (asset: SelectedAsset) => {
    setConfigurationModal({
      open: true,
      asset
    });
  };

  const handleSaveConfiguration = (config: any) => {
    if (configurationModal.asset) {
      console.log('Processando configuração:', config);
      
      const updatedAsset = {
        ...configurationModal.asset,
        ...config
      };
      
      console.log('Ativo atualizado:', updatedAsset);
      onEditAsset(updatedAsset);
      
      // Se há associação de CHIP e é um equipamento
      if (config.associatedChipId && config.uuid && config.uuid !== config.associatedChipId) {
        // Encontrar o CHIP nos assets selecionados
        const chipAsset = assets.find(a => a.uuid === config.associatedChipId);
        if (chipAsset) {
          const updatedChip = {
            ...chipAsset,
            associatedEquipmentId: config.uuid,
            isPrincipalChip: config.isPrincipalChip || false,
            notes: (config.isPrincipalChip ? 'principal' : 'backup') + ' - associado'
          };
          
          console.log('CHIP associado atualizado:', updatedChip);
          onEditAsset(updatedChip);
        }
      }
      
      // Se é uma configuração de CHIP que veio como segunda chamada
      if (config.uuid && config.uuid !== configurationModal.asset.uuid) {
        const chipAsset = assets.find(a => a.uuid === config.uuid);
        if (chipAsset) {
          const updatedChip = {
            ...chipAsset,
            ...config
          };
          
          console.log('CHIP configurado:', updatedChip);
          onEditAsset(updatedChip);
        }
      }
    }
    
    // Fechar modal
    setConfigurationModal({ open: false, asset: null });
  };

  const handleCloseConfiguration = () => {
    setConfigurationModal({ open: false, asset: null });
  };

  return (
    <>
      <Card className="border-[#4D2BFB]/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Ativos Selecionados ({assets.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Wifi className="h-3 w-3 mr-1" />
                {equipmentCount}
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Smartphone className="h-3 w-3 mr-1" />
                {chipCount}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {assets.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {assets.map((asset) => (
                <AssetCard
                  key={asset.uuid}
                  asset={asset}
                  mode="selected"
                  onEdit={onEditAsset}
                  onRemove={onRemoveAsset}
                  onConfigure={handleConfigureAsset}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum ativo selecionado</p>
              <p className="text-sm">
                Use a busca acima para adicionar ativos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Configuração */}
      {configurationModal.asset && (
        <AssetConfigurationForm
          asset={configurationModal.asset}
          open={configurationModal.open}
          onClose={handleCloseConfiguration}
          onSave={handleSaveConfiguration}
          selectedAssets={assets}
          excludeAssociatedToClient={excludeAssociatedToClient}
        />
      )}
    </>
  );
};
