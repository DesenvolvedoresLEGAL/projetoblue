
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Trash2, List, Calendar, Wifi } from "lucide-react";
import { Client } from '@/types/client';
import { SelectedAsset } from '@/pages/AssetAssociation';
import { AssetSearchForm } from './AssetSearchForm';
import { AssetConfigurationForm } from './AssetConfigurationForm';
import { AssetListModal } from './AssetListModal';
import { formatPhoneForDisplay } from '@/utils/clientMappers';

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
  const [showEquipmentList, setShowEquipmentList] = useState(false);
  const [showChipList, setShowChipList] = useState(false);

  const handleAssetFound = (asset: SelectedAsset) => {
    onAssetAdded(asset);
    setIsAddingAsset(false);
  };

  const handleAssetUpdate = (assetId: string, updates: Partial<SelectedAsset>) => {
    onAssetUpdated(assetId, updates);
  };

  // Usar telefones da nova estrutura
  const primaryPhone = client.telefones && client.telefones.length > 0 
    ? formatPhoneForDisplay(client.telefones[0]) 
    : '';

  // Função para determinar o tipo de ativo
  const getAssetTypeInfo = (asset: SelectedAsset) => {
    const isChip = asset.solution_id === 11;
    return {
      isChip,
      emoji: isChip ? '📱' : '📡',
      label: isChip ? 'CHIP' : 'EQUIPAMENTO',
      identifier: isChip ? `ICCID: ${asset.iccid}` : `Rádio: ${asset.radio || asset.serial_number}`
    };
  };

  // Validação para prosseguir
  const canProceed = selectedAssets.length > 0 && selectedAssets.every(asset => {
    // Validar data de início obrigatória
    if (!asset.startDate) return false;
    
    // Validar que data de fim seja posterior à data de início (se preenchida)
    if (asset.endDate && asset.startDate) {
      const startDate = new Date(asset.startDate);
      const endDate = new Date(asset.endDate);
      if (endDate <= startDate) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Informações do cliente selecionado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cliente Selecionado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Empresa:</span>
              <p className="text-muted-foreground">{client.empresa}</p>
            </div>
            <div>
              <span className="font-medium">Responsável:</span>
              <p className="text-muted-foreground">{client.responsavel}</p>
            </div>
            <div>
              <span className="font-medium">Telefone:</span>
              <p className="text-muted-foreground">{primaryPhone}</p>
            </div>
            {client.email && (
              <div>
                <span className="font-medium">Email:</span>
                <p className="text-muted-foreground">{client.email}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seleção de ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Configurar Ativos para Associação
          </CardTitle>
          <CardDescription>
            Adicione CHIPs e equipamentos à associação. Configure os dados de cada ativo individualmente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de ativos selecionados */}
          {selectedAssets.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Ativos Selecionados ({selectedAssets.length})</h4>
              {selectedAssets.map((asset) => {
                const typeInfo = getAssetTypeInfo(asset);
                return (
                  <div key={asset.uuid} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {typeInfo.emoji} {typeInfo.label}
                          {asset.solucao && ` - ${asset.solucao}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {typeInfo.identifier}
                        </div>
                        {/* Indicadores de configuração */}
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {asset.associationType || 'Tipo não definido'}
                          </div>
                          {!typeInfo.isChip && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Wifi className="h-3 w-3" />
                              {asset.ssid_atual ? 'SSID configurado' : 'SSID não configurado'}
                            </div>
                          )}
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
                );
              })}
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
            <div className="space-y-2">
              {!canProceed && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  ⚠️ Alguns ativos possuem configurações inválidas. Verifique:
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Data de início é obrigatória</li>
                    <li>Data de fim deve ser posterior à data de início</li>
                  </ul>
                </div>
              )}
              <Button 
                onClick={onProceed} 
                className="w-full"
                disabled={!canProceed}
              >
                Continuar para Confirmação
              </Button>
            </div>
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
