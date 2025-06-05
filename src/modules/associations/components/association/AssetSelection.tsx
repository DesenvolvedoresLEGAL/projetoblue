
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UnifiedAssetSearch } from './UnifiedAssetSearch';
import { SelectedAssetsGrid } from './SelectedAssetsGrid';
import { AssociationGeneralConfigComponent, AssociationGeneralConfig } from './AssociationGeneralConfig';
import { AssetSpecificConfig } from './AssetSpecificConfig';
import { AssetConfigurationForm } from './AssetConfigurationForm';
import { SelectedAsset } from '@modules/associations/types';
import { AssetWithRelations } from '@modules/assets/hooks/useAssetsData';
import { Wifi, Smartphone, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface AssetSelectionProps {
  client: any;
  selectedAssets: SelectedAsset[];
  onAssetAdded: (asset: SelectedAsset) => void;
  onAssetRemoved: (assetId: string) => void;
  onAssetUpdated: (assetId: string, updates: any) => void;
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
  const [editingAsset, setEditingAsset] = useState<SelectedAsset | null>(null);
  
  // Estado para configuração geral da associação
  const [generalConfig, setGeneralConfig] = useState<AssociationGeneralConfig>({
    associationType: 'ALUGUEL',
    startDate: new Date(),
    endDate: undefined,
    notes: ''
  });

  // Convert SelectedAsset back to AssetWithRelations format for compatibility
  const convertToAssetWithRelations = (selectedAsset: SelectedAsset): AssetWithRelations => {
    return {
      uuid: selectedAsset.uuid,
      model: selectedAsset.model,
      serial_number: selectedAsset.serial_number,
      radio: selectedAsset.radio,
      solution_id: selectedAsset.solution_id,
      manufacturer_id: selectedAsset.manufacturer_id,
      plan_id: selectedAsset.plan_id,
      rented_days: selectedAsset.rented_days || 0,
      admin_user: selectedAsset.admin_user || 'admin',
      admin_pass: selectedAsset.admin_pass || '',
      iccid: selectedAsset.iccid,
      line_number: selectedAsset.line_number ? parseInt(selectedAsset.line_number) : undefined,
      ssid_atual: selectedAsset.ssid_atual,
      pass_atual: selectedAsset.pass_atual,
      // Required fields for AssetWithRelations
      status_id: selectedAsset.statusId || 1,
      created_at: selectedAsset.registrationDate,
      updated_at: new Date().toISOString(),
      manufacturer: {
        id: selectedAsset.manufacturer_id || 0,
        name: selectedAsset.marca || selectedAsset.brand || ''
      },
      status: {
        id: selectedAsset.statusId || 1,
        name: selectedAsset.status
      },
      solucao: selectedAsset.solucao ? {
        id: selectedAsset.solution_id || 0,
        name: selectedAsset.solucao
      } : undefined
    };
  };

  const handleEditAsset = (asset: SelectedAsset) => {
    setEditingAsset(asset);
  };

  const handleSaveAssetConfig = (assetId: string, config: any) => {
    onAssetUpdated(assetId, config);
    setEditingAsset(null);
  };

  const handleGeneralConfigUpdate = (updates: Partial<AssociationGeneralConfig>) => {
    setGeneralConfig(prev => ({ ...prev, ...updates }));
  };

  const handleAssetSpecificUpdate = (assetId: string, updates: any) => {
    onAssetUpdated(assetId, updates);
  };

  const handleProceed = () => {
    if (selectedAssets.length === 0) {
      toast.error('Selecione pelo menos um ativo para prosseguir');
      return;
    }
    
    // Validar configuração geral
    if (!generalConfig.startDate) {
      toast.error('Data de início é obrigatória');
      return;
    }
    
    if (generalConfig.endDate && generalConfig.endDate < generalConfig.startDate) {
      toast.error('Data de fim deve ser posterior à data de início');
      return;
    }
    
    onProceed();
  };

  const equipmentCount = selectedAssets.filter(asset => asset.type === 'EQUIPMENT').length;
  const chipCount = selectedAssets.filter(asset => asset.type === 'CHIP').length;

  return (
    <div className="space-y-6">
      {/* Header da seleção */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Selecionar Ativos para {client?.nome}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Busque e selecione os ativos que serão associados ao cliente
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Wifi className="h-3 w-3 mr-1" />
            {equipmentCount} Equipamentos
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Smartphone className="h-3 w-3 mr-1" />
            {chipCount} CHIPs
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna da esquerda: Busca unificada */}
        <div>
          <UnifiedAssetSearch
            selectedAssets={selectedAssets}
            onAssetSelected={onAssetAdded}
          />
        </div>

        {/* Coluna da direita: Ativos selecionados */}
        <div>
          <SelectedAssetsGrid
            assets={selectedAssets}
            onRemoveAsset={onAssetRemoved}
            onEditAsset={handleEditAsset}
          />
        </div>
      </div>

      {/* Configuração Geral da Associação - sempre visível quando há ativos */}
      {selectedAssets.length > 0 && (
        <AssociationGeneralConfigComponent
          config={generalConfig}
          onUpdate={handleGeneralConfigUpdate}
        />
      )}

      {/* Configurações Específicas dos Ativos */}
      {selectedAssets.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Configurações Específicas dos Ativos
          </h4>
          {selectedAssets.map((asset) => (
            <AssetSpecificConfig
              key={asset.uuid}
              asset={convertToAssetWithRelations(asset)}
              associationType={generalConfig.associationType}
              onUpdate={(updates) => handleAssetSpecificUpdate(asset.uuid, updates)}
            />
          ))}
        </div>
      )}

      {/* Resumo e ações */}
      {selectedAssets.length > 0 && (
        <Card className="border-[#03F9FF]/30 bg-gradient-to-r from-[#03F9FF]/5 to-[#4D2BFB]/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900">
                  Resumo da Seleção
                </h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{selectedAssets.length} ativos selecionados</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{equipmentCount} equipamentos</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{chipCount} CHIPs</span>
                </div>
                <div className="text-xs text-gray-500">
                  Tipo: {generalConfig.associationType} | 
                  Início: {generalConfig.startDate.toLocaleDateString('pt-BR')}
                  {generalConfig.endDate && ` | Fim: ${generalConfig.endDate.toLocaleDateString('pt-BR')}`}
                </div>
              </div>
              <Button
                onClick={handleProceed}
                className="bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white"
                size="lg"
              >
                Prosseguir para Resumo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de configuração avançada */}
      {editingAsset && (
        <AssetConfigurationForm
          asset={editingAsset}
          open={!!editingAsset}
          onClose={() => setEditingAsset(null)}
          onSave={(config) => handleSaveAssetConfig(editingAsset.uuid, config)}
        />
      )}
    </div>
  );
};
