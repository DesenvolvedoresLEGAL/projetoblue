
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AssetSearchForm } from './AssetSearchForm';
import { AssetListModal } from './AssetListModal';
import { SelectedAssetsList } from './SelectedAssetsList';
import { AssociationGeneralConfigComponent, AssociationGeneralConfig } from './AssociationGeneralConfig';
import { AssetSpecificConfig } from './AssetSpecificConfig';
import { AssetConfigurationForm } from './AssetConfigurationForm';
import { SelectedAsset } from '@modules/associations/types';
import { AssetWithRelations } from '@modules/assets/hooks/useAssetsData';
import { Search, Plus, Wifi, Smartphone, ArrowRight } from 'lucide-react';
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
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showChipModal, setShowChipModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<SelectedAsset | null>(null);
  
  // Estado para configuração geral da associação
  const [generalConfig, setGeneralConfig] = useState<AssociationGeneralConfig>({
    associationType: 'ALUGUEL',
    startDate: new Date(),
    endDate: undefined,
    notes: ''
  });

  const handleAssetFound = (asset: SelectedAsset) => {
    onAssetAdded(asset);
  };

  // Convert AssetWithRelations to SelectedAsset with proper mapping
  const convertToSelectedAsset = (asset: AssetWithRelations): SelectedAsset => {
    return {
      id: asset.uuid,
      uuid: asset.uuid,
      type: asset.solution_id === 11 ? 'CHIP' : 'EQUIPMENT',
      registrationDate: asset.created_at || new Date().toISOString(),
      status: asset.status?.name || 'DISPONÍVEL',
      statusId: asset.status_id,
      solucao: asset.solucao?.name,
      marca: asset.manufacturer?.name,
      modelo: asset.model,
      serial_number: asset.serial_number,
      radio: asset.radio,
      solution_id: asset.solution_id,
      manufacturer_id: asset.manufacturer_id,
      plan_id: asset.plan_id,
      rented_days: asset.rented_days,
      admin_user: asset.admin_user,
      admin_pass: asset.admin_pass,
      iccid: asset.iccid,
      line_number: asset.line_number?.toString(),
      ssid_atual: asset.ssid_atual,
      pass_atual: asset.pass_atual,
      // Add missing required properties for compatibility
      brand: asset.manufacturer?.name || '',
      model: asset.model || '',
      phoneNumber: asset.line_number?.toString() || '',
      carrier: asset.manufacturer?.name || '',
      uniqueId: asset.uuid,
      ssid: asset.ssid_atual || '',
      password: asset.pass_atual || '',
      serialNumber: asset.serial_number || ''
    };
  };

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
        name: selectedAsset.marca || selectedAsset.brand || '',
        country: null,
        description: '',
        website: null,
        created_at: new Date().toISOString(),
        updated_at: null,
        deleted_at: null
      },
      status: {
        id: selectedAsset.statusId || 1,
        status: selectedAsset.status,
        association: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      },
      solucao: selectedAsset.solucao ? {
        id: selectedAsset.solution_id || 0,
        solution: selectedAsset.solucao,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      } : undefined
    };
  };

  const handleAssetFromModal = (asset: AssetWithRelations) => {
    const selectedAsset = convertToSelectedAsset(asset);
    onAssetAdded(selectedAsset);
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
        {/* Coluna da esquerda: Busca de ativos */}
        <div className="space-y-4">
          {/* Formulário de busca direta */}
          <Card className="border-[#4D2BFB]/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4" />
                Busca Direta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AssetSearchForm
                onAssetFound={handleAssetFound}
                selectedAssets={selectedAssets}
              />
            </CardContent>
          </Card>

          {/* Botões para modal de listagem */}
          <Card className="border-[#4D2BFB]/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4" />
                Selecionar da Lista
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setShowEquipmentModal(true)}
                variant="outline"
                className="w-full justify-start h-12 border-blue-200 hover:bg-blue-50"
              >
                <Wifi className="h-4 w-4 mr-2 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Equipamentos Disponíveis</div>
                  <div className="text-xs text-muted-foreground">
                    Roteadores, Access Points, etc.
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => setShowChipModal(true)}
                variant="outline"
                className="w-full justify-start h-12 border-green-200 hover:bg-green-50"
              >
                <Smartphone className="h-4 w-4 mr-2 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">CHIPs Disponíveis</div>
                  <div className="text-xs text-muted-foreground">
                    Cartões SIM para conectividade
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna da direita: Ativos selecionados */}
        <div>
          <Card className="border-[#4D2BFB]/20 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Ativos Selecionados ({selectedAssets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAssets.length > 0 ? (
                <SelectedAssetsList
                  assets={selectedAssets}
                  onRemoveAsset={onAssetRemoved}
                  onEditAsset={handleEditAsset}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum ativo selecionado</p>
                  <p className="text-sm">
                    Use a busca ou os botões acima para adicionar ativos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
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

      {/* Modais */}
      <AssetListModal
        open={showEquipmentModal}
        onOpenChange={setShowEquipmentModal}
        onAssetSelected={handleAssetFromModal}
        selectedAssets={selectedAssets}
        type="equipment"
      />

      <AssetListModal
        open={showChipModal}
        onOpenChange={setShowChipModal}
        onAssetSelected={handleAssetFromModal}
        selectedAssets={selectedAssets}
        type="chip"
      />

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
