
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Trash2, List } from "lucide-react";
import { Client } from '@/types/client';
import { SelectedAsset } from '@/pages/AssetAssociation';
import { AssetSearchForm } from './AssetSearchForm';
import { AssetSpecificConfig } from './AssetSpecificConfig';
import { AssociationGeneralConfigComponent, AssociationGeneralConfig } from './AssociationGeneralConfig';
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
  
  // Estado para configuração geral da associação
  const [generalConfig, setGeneralConfig] = useState<AssociationGeneralConfig>({
    associationType: 'ALUGUEL',
    startDate: new Date(),
    endDate: undefined,
    notes: ''
  });

  const handleAssetFound = (asset: SelectedAsset) => {
    onAssetAdded(asset);
    setIsAddingAsset(false);
  };

  const handleAssetUpdate = (assetId: string, updates: Partial<SelectedAsset>) => {
    onAssetUpdated(assetId, updates);
  };

  const handleGeneralConfigUpdate = (updates: Partial<AssociationGeneralConfig>) => {
    setGeneralConfig(prev => ({ ...prev, ...updates }));
  };

  // Usar telefones da nova estrutura
  const primaryPhone = client.telefones && client.telefones.length > 0 
    ? formatPhoneForDisplay(client.telefones[0]) 
    : '';

  // Validação: data de fim deve ser posterior à data de início
  const isConfigValid = !generalConfig.endDate || generalConfig.endDate >= generalConfig.startDate;

  // Validação específica para CHIPs - verificar se todos os campos obrigatórios estão preenchidos
  const validateChipAssets = () => {
    const chipAssets = selectedAssets.filter(asset => 
      asset.solution_id === 11 || asset.type === 'CHIP'
    );

    for (const chip of chipAssets) {
      // Verificar se tem plano selecionado
      if (!chip.plan_id) {
        return `CHIP ${chip.iccid || chip.uuid} precisa ter um plano selecionado`;
      }

      // Se for plano customizado, verificar se tem GB definido
      // Assumindo que planos customizados têm nomes específicos
      const isCustomPlan = chip.plan_id && (
        // Aqui você pode ajustar a lógica baseada nos nomes dos planos na sua base
        chip.gb !== undefined && chip.gb > 0
      );

      if (isCustomPlan && (!chip.gb || chip.gb <= 0)) {
        return `CHIP ${chip.iccid || chip.uuid} com plano customizado precisa ter tamanho (GB) informado`;
      }
    }

    return null;
  };

  const chipValidationError = validateChipAssets();
  const canProceed = selectedAssets.length > 0 && isConfigValid && !chipValidationError;

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

      {/* Configuração Geral da Associação - UMA VEZ APENAS */}
      <AssociationGeneralConfigComponent
        config={generalConfig}
        onUpdate={handleGeneralConfigUpdate}
      />

      {/* Seleção de ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Selecionar Ativos
          </CardTitle>
          <CardDescription>
            Adicione CHIPs e equipamentos à associação. CHIPs requerem seleção de plano.
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

                  {/* Configurações específicas do ativo */}
                  <AssetSpecificConfig
                    asset={asset}
                    associationType={generalConfig.associationType}
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

          {/* Mensagens de validação */}
          {selectedAssets.length > 0 && !isConfigValid && (
            <div className="text-sm text-red-500 text-center">
              Corrija a configuração da associação antes de continuar
            </div>
          )}

          {chipValidationError && (
            <div className="text-sm text-red-500 text-center p-3 bg-red-50 rounded border-l-4 border-red-400">
              <strong>⚠️ Validação:</strong> {chipValidationError}
            </div>
          )}

          {/* Botão para continuar */}
          {selectedAssets.length > 0 && (
            <Button 
              onClick={onProceed} 
              className="w-full"
              disabled={!canProceed}
            >
              {canProceed ? 'Continuar para Confirmação' : 'Complete as configurações para continuar'}
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
