
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Trash2 } from "lucide-react";
import { Client } from '@/types/asset';
import { SelectedAsset } from '@/pages/AssetAssociation';
import { AssetSearchForm } from './AssetSearchForm';
import { AssetConfigurationForm } from './AssetConfigurationForm';
import { formatPhoneNumber } from '@/utils/phoneFormatter';

interface AssetSelectionProps {
  client: Client;
  selectedAssets: SelectedAsset[];
  onAssetAdded: (asset: SelectedAsset) => void;
  onAssetRemoved: (assetId: string) => void;
  onAssetUpdated: (assetId: string, updatedAsset: Partial<SelectedAsset>) => void;
  onProceed: () => void;
}

export const AssetSelection: React.FC<AssetSelectionProps> = ({
  client,
  selectedAssets,
  onAssetAdded,
  onAssetRemoved,
  onAssetUpdated,
  onProceed
}) => {
  const [isAddingAsset, setIsAddingAsset] = useState(false);

  const handleAssetFound = (asset: SelectedAsset) => {
    onAssetAdded(asset);
    setIsAddingAsset(false);
  };

  const handleAssetUpdate = (assetId: string, updates: Partial<SelectedAsset>) => {
    onAssetUpdated(assetId, updates);
  };

  return (
    <div className="space-y-6">
      {/* Informações do cliente selecionado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cliente Selecionado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Nome:</span>
              <p className="text-muted-foreground">{client.nome}</p>
            </div>
            <div>
              <span className="font-medium">CNPJ:</span>
              <p className="text-muted-foreground">{client.cnpj}</p>
            </div>
            <div>
              <span className="font-medium">Telefone:</span>
              <p className="text-muted-foreground">{formatPhoneNumber(client.contato)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                        {asset.type === 'CHIP' ? '📱' : '📡'} 
                        {asset.type === 'CHIP' ? 'CHIP' : 'EQUIPAMENTO'} 
                        {asset.solucao && ` - ${asset.solucao}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {asset.type === 'CHIP' ? `ICCID: ${asset.iccid}` : `Rádio: ${asset.radio || asset.serial_number}`}
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

          {/* Formulário para adicionar novo ativo */}
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
            <Button
              variant="outline"
              onClick={() => setIsAddingAsset(true)}
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Ativo
            </Button>
          )}

          {/* Botão para continuar */}
          {selectedAssets.length > 0 && (
            <Button onClick={onProceed} className="w-full">
              Continuar para Confirmação
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
