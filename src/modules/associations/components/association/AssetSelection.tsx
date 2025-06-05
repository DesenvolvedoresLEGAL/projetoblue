
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
import { Wifi, Smartphone, ArrowRight, User } from 'lucide-react';
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header da seleção - informações do cliente */}
      <Card className="border-[#4D2BFB]/20 bg-gradient-to-r from-[#4D2BFB]/5 to-[#03F9FF]/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#4D2BFB]/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-[#4D2BFB]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Associar Ativos para {client?.nome}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {client?.email && `${client.email} • `}
                  {client?.telefone && `${client.telefone} • `}
                  {client?.empresa || 'Cliente Individual'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
        </CardContent>
      </Card>

      {/* Seção 1: Busca de Ativos */}
      <div className="space-y-2">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-[#4D2BFB] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
          Buscar e Selecionar Ativos
        </h4>
        <p className="text-sm text-gray-600 ml-10">
          Use a busca direta ou os filtros avançados para encontrar e adicionar ativos à associação
        </p>
        <UnifiedAssetSearch
          selectedAssets={selectedAssets}
          onAssetSelected={onAssetAdded}
        />
      </div>

      {/* Seção 2: Ativos Selecionados */}
      {selectedAssets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#03F9FF] text-[#020CBC] rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Ativos Selecionados ({selectedAssets.length})
          </h4>
          <p className="text-sm text-gray-600 ml-10">
            Revise os ativos selecionados e faça ajustes se necessário
          </p>
          <SelectedAssetsGrid
            assets={selectedAssets}
            onRemoveAsset={onAssetRemoved}
            onEditAsset={handleEditAsset}
          />
        </div>
      )}

      {/* Seção 3: Configuração Geral da Associação */}
      {selectedAssets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#4D2BFB] text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            Configuração da Associação
          </h4>
          <p className="text-sm text-gray-600 ml-10">
            Defina os parâmetros gerais que se aplicam a todos os ativos desta associação
          </p>
          <AssociationGeneralConfigComponent
            config={generalConfig}
            onUpdate={handleGeneralConfigUpdate}
          />
        </div>
      )}

      {/* Seção 4: Configurações Específicas dos Ativos */}
      {selectedAssets.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#03F9FF] text-[#020CBC] rounded-full flex items-center justify-center text-sm font-bold">4</span>
              Configurações Específicas dos Ativos
            </h4>
            <p className="text-sm text-gray-600 ml-10">
              Configure cada ativo individualmente conforme suas necessidades específicas
            </p>
          </div>
          
          <div className="space-y-4 ml-10">
            {selectedAssets.map((asset, index) => (
              <div key={asset.uuid} className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {index + 1}. {asset.type === 'CHIP' ? 'CHIP' : 'Equipamento'}:
                  </span>
                  <span className="text-sm text-gray-900 font-medium">
                    {asset.type === 'CHIP' 
                      ? (asset.iccid || asset.line_number || asset.uuid.substring(0, 8))
                      : (asset.radio || asset.serial_number || asset.uuid.substring(0, 8))
                    }
                  </span>
                </div>
                <AssetSpecificConfig
                  asset={convertToAssetWithRelations(asset)}
                  associationType={generalConfig.associationType}
                  onUpdate={(updates) => handleAssetSpecificUpdate(asset.uuid, updates)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 5: Resumo e Finalização */}
      {selectedAssets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-[#4D2BFB] text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
            Finalizar Associação
          </h4>
          <p className="text-sm text-gray-600 ml-10">
            Revise todas as configurações e confirme a criação da associação
          </p>
          
          <Card className="border-[#03F9FF]/30 bg-gradient-to-r from-[#03F9FF]/5 to-[#4D2BFB]/5 ml-10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h5 className="font-semibold text-gray-900">
                    Resumo da Associação
                  </h5>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-medium">{selectedAssets.length} ativos selecionados</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{equipmentCount} equipamentos</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{chipCount} CHIPs</span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      <strong>Cliente:</strong> {client?.nome} • <strong>Tipo:</strong> {generalConfig.associationType}
                    </div>
                    <div>
                      <strong>Início:</strong> {generalConfig.startDate.toLocaleDateString('pt-BR')}
                      {generalConfig.endDate && (
                        <>
                          {' • '}
                          <strong>Fim:</strong> {generalConfig.endDate.toLocaleDateString('pt-BR')}
                        </>
                      )}
                    </div>
                    {generalConfig.notes && (
                      <div>
                        <strong>Observações:</strong> {generalConfig.notes}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleProceed}
                  className="bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white"
                  size="lg"
                >
                  Criar Associação
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
