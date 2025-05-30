
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Trash2, List } from "lucide-react";
import { SelectedAsset } from '@/pages/AssetAssociation';
import { AssetSearchForm } from './AssetSearchForm';
import { AssetConfigurationForm } from './AssetConfigurationForm';
import { AssetListModal } from './AssetListModal';

interface AssetSelectionProps {
  selectedAssets: SelectedAsset[];
  onAssetAdded: (asset: SelectedAsset) => void;
  onAssetRemoved: (assetId: string) => void;
  onAssetUpdated: (assetId: string, updatedAsset: Partial<SelectedAsset>) => void;
  onProceed: () => void;
}

export const AssetSelection: React.FC<AssetSelectionProps> = ({
  selectedAssets,
  onAssetAdded,
  onAssetRemoved,
  onAssetUpdated,
  onProceed
}) => {
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [showEquipmentList, setShowEquipmentList] = useState(false);
  const [showChipList, setShowChipList] = useState(false);

  const handleAssetFound = (asset: SelectedAsset) => {
    onAssetAdded(asset);
    setIsAddingAsset(false);
  };

  const handleAssetUpdate = (assetId: string, updates: Partial<SelectedAsset>) => {
    onAssetUpdated(assetId, updates);
  };

  return (
    <div className="space-y-6">
      {/* Seleção de ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Selecionar Ativos
          </CardTitle>
          <CardDescription>
            Adicione CHIPs e equipamentos à associação. Equipamentos SPEEDY 5G requerem um CHIP obrigatoriamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de ativos selecionados */}
          {selectedAssets.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Ativos Selecionados ({selectedAssets.length})</h4>
              {selectedAssets.map((asset) => (
                <div key={asset.uuid} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {asset.solution_id === 11 ? '📱' : '📡'} 
                        {asset.solution_id === 11 ? 'CHIP' : 'EQUIPAMENTO'} 
                        {asset.solucao && ` - ${asset.solucao}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {asset.solution_id === 11 ? `ICCID: ${asset.iccid}` : `Rádio: ${asset.radio || asset.serial_number}`}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAssetRemoved(asset.uuid)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Formulário de configuração do ativo */}
                  <AssetConfigurationForm
                    asset={asset}
                    onUpdate={(updates) => handleAssetUpdate(asset.uuid, updates)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Opções para adicionar novos ativos */}
          {isAddingAsset ? (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Buscar Ativo</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingAsset(false)}
                >
                  Cancelar
                </Button>
              </div>
              <AssetSearchForm
                onAssetFound={handleAssetFound}
                selectedAssets={selectedAssets}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Botão para busca rápida */}
              <Button
                variant="outline"
                onClick={() => setIsAddingAsset(true)}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Buscar Ativo (Rápido)
              </Button>

              {/* Botões para visualizar listas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEquipmentList(true)}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  📡 Ver Equipamentos Disponíveis
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowChipList(true)}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  📱 Ver CHIPs Disponíveis
                </Button>
              </div>
            </div>
          )}

          {/* Botão para continuar */}
          {selectedAssets.length > 0 && (
            <Button onClick={onProceed} className="w-full">
              Continuar para Confirmação
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Modais de listagem */}
      <AssetListModal
        open={showEquipmentList}
        onOpenChange={setShowEquipmentList}
        onAssetSelected={handleAssetFound}
        selectedAssets={selectedAssets}
        type="equipment"
      />

      <AssetListModal
        open={showChipList}
        onOpenChange={setShowChipList}
        onAssetSelected={handleAssetFound}
        selectedAssets={selectedAssets}
        type="chip"
      />
    </div>
  );
};
