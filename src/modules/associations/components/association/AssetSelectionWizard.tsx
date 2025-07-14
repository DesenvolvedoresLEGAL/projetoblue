
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { SelectedAsset } from '@modules/associations/types';
import { useAssetBusinessRules } from '@modules/associations/hooks/useAssetBusinessRules';
import { SmartAssetSelectionCard } from './SmartAssetSelectionCard';
import { ChipAssociationModal } from './ChipAssociationModal';
import { ResponsiveAssetModal } from './modal/ResponsiveAssetModal';

interface AssetSelectionWizardProps {
  selectedAssets: SelectedAsset[];
  onAssetsChange: (assets: SelectedAsset[]) => void;
  onComplete: () => void;
  excludeAssociatedToClient?: string;
}

type WizardStep = 'equipment' | 'chip-association' | 'backup-chips' | 'review';

interface AssetWithChip {
  equipment: SelectedAsset;
  chip: SelectedAsset | null;
}

export const AssetSelectionWizard: React.FC<AssetSelectionWizardProps> = ({
  selectedAssets,
  onAssetsChange,
  onComplete,
  excludeAssociatedToClient
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('equipment');
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showChipModal, setShowChipModal] = useState(false);
  const [equipmentNeedingChip, setEquipmentNeedingChip] = useState<SelectedAsset | null>(null);
  const [equipmentChipPairs, setEquipmentChipPairs] = useState<AssetWithChip[]>([]);

  const { validateSelection } = useAssetBusinessRules(selectedAssets);

  // Separar assets por tipo e necessidade
  const assetGroups = useMemo(() => {
    const equipmentNeedingChips = selectedAssets.filter(asset => 
      asset.type === 'EQUIPMENT' && [1, 2, 4].includes(asset.solution_id || 0)
    );
    const independentEquipment = selectedAssets.filter(asset => 
      asset.type === 'EQUIPMENT' && ![1, 2, 4].includes(asset.solution_id || 0)
    );
    const chips = selectedAssets.filter(asset => asset.type === 'CHIP');
    const backupChips = chips.filter(chip => !chip.associatedEquipmentId);

    return {
      equipmentNeedingChips,
      independentEquipment,
      chips,
      backupChips
    };
  }, [selectedAssets]);

  const handleAssetSelected = (asset: SelectedAsset) => {
    const updatedAssets = [...selectedAssets, asset];
    onAssetsChange(updatedAssets);
    setShowAssetModal(false);
  };

  const handleAssetRemoved = (assetId: string) => {
    const updatedAssets = selectedAssets.filter(a => a.uuid !== assetId);
    onAssetsChange(updatedAssets);
    
    // Remover também da lista de pares se necessário
    setEquipmentChipPairs(pairs => 
      pairs.filter(pair => pair.equipment.uuid !== assetId && pair.chip?.uuid !== assetId)
    );
  };

  const handleChipAssociation = (equipment: SelectedAsset) => {
    setEquipmentNeedingChip(equipment);
    setShowChipModal(true);
  };

  const handleChipSelected = (chip: SelectedAsset, equipmentId: string) => {
    // Atualizar o asset do chip com associação
    const updatedAssets = selectedAssets.map(asset => {
      if (asset.uuid === chip.uuid) {
        return { ...asset, associatedEquipmentId: equipmentId, isPrincipalChip: true };
      }
      return asset;
    });
    
    onAssetsChange(updatedAssets);
    
    // Atualizar pares equipment-chip
    const equipment = selectedAssets.find(a => a.uuid === equipmentId);
    if (equipment) {
      setEquipmentChipPairs(pairs => [
        ...pairs.filter(p => p.equipment.uuid !== equipmentId),
        { equipment, chip: { ...chip, associatedEquipmentId: equipmentId, isPrincipalChip: true } }
      ]);
    }
    
    setShowChipModal(false);
    setEquipmentNeedingChip(null);
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 'equipment':
        return selectedAssets.some(a => a.type === 'EQUIPMENT');
      case 'chip-association':
        return assetGroups.equipmentNeedingChips.every(equipment => 
          selectedAssets.some(asset => 
            asset.type === 'CHIP' && asset.associatedEquipmentId === equipment.uuid
          )
        );
      case 'backup-chips':
        return true; // Sempre pode prosseguir (CHIPs backup são opcionais)
      case 'review':
        return validateSelection.isValid;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'equipment':
        return 'Selecionar Equipamentos';
      case 'chip-association':
        return 'Associar CHIPs Obrigatórios';
      case 'backup-chips':
        return 'Adicionar CHIPs Backup (Opcional)';
      case 'review':
        return 'Revisar Seleção';
      default:
        return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'equipment':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Button
                onClick={() => setShowAssetModal(true)}
                className="bg-[#4D2BFB] hover:bg-[#4D2BFB]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Equipamento
              </Button>
            </div>
            
            {assetGroups.equipmentNeedingChips.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-orange-800">
                  Equipamentos que Precisam de CHIP
                </h3>
                <div className="grid gap-3">
                  {assetGroups.equipmentNeedingChips.map(asset => (
                    <SmartAssetSelectionCard
                      key={asset.uuid}
                      asset={asset}
                      onRemove={handleAssetRemoved}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {assetGroups.independentEquipment.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-green-800">
                  Equipamentos Independentes
                </h3>
                <div className="grid gap-3">
                  {assetGroups.independentEquipment.map(asset => (
                    <SmartAssetSelectionCard
                      key={asset.uuid}
                      asset={asset}
                      onRemove={handleAssetRemoved}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'chip-association':
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-orange-800">
                    CHIPs Obrigatórios
                  </h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Os equipamentos SPEEDY 5G, 4 PLUS e 4 BLACK precisam ser associados a um CHIP
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid gap-3">
              {assetGroups.equipmentNeedingChips.map(equipment => {
                const associatedChip = selectedAssets.find(chip => 
                  chip.type === 'CHIP' && chip.associatedEquipmentId === equipment.uuid
                );
                
                return (
                  <SmartAssetSelectionCard
                    key={equipment.uuid}
                    asset={equipment}
                    onAssociateChip={handleChipAssociation}
                    associatedChip={associatedChip}
                    onRemove={handleAssetRemoved}
                  />
                );
              })}
            </div>
          </div>
        );

      case 'backup-chips':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800">
                CHIPs Backup (Opcional)
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Adicione CHIPs backup que não estarão associados a equipamentos específicos
              </p>
            </div>
            
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowAssetModal(true)}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar CHIP Backup
              </Button>
            </div>
            
            {assetGroups.backupChips.length > 0 && (
              <div className="grid gap-3">
                {assetGroups.backupChips.map(chip => (
                  <SmartAssetSelectionCard
                    key={chip.uuid}
                    asset={chip}
                    isChipPrincipal={false}
                    onRemove={handleAssetRemoved}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            {/* Validação */}
            {validateSelection.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-800 mb-2">Problemas Encontrados:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {validateSelection.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validateSelection.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">Avisos:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {validateSelection.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validateSelection.isValid && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-green-800">
                    Seleção Válida
                  </h3>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Todos os equipamentos estão devidamente configurados
                </p>
              </div>
            )}
            
            {/* Resumo */}
            <div className="space-y-3">
              <h3 className="font-medium">Resumo da Seleção:</h3>
              <div className="grid gap-2">
                {selectedAssets.map(asset => (
                  <SmartAssetSelectionCard
                    key={asset.uuid}
                    asset={asset}
                    associatedChip={
                      asset.type === 'EQUIPMENT' 
                        ? selectedAssets.find(chip => chip.associatedEquipmentId === asset.uuid)
                        : undefined
                    }
                    isChipPrincipal={asset.isPrincipalChip}
                    className="opacity-90"
                  />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{getStepTitle()}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Etapa {currentStep === 'equipment' ? 1 : currentStep === 'chip-association' ? 2 : currentStep === 'backup-chips' ? 3 : 4} de 4
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStepContent()}
        
        {/* Navegação */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              const steps: WizardStep[] = ['equipment', 'chip-association', 'backup-chips', 'review'];
              const currentIndex = steps.indexOf(currentStep);
              if (currentIndex > 0) {
                setCurrentStep(steps[currentIndex - 1]);
              }
            }}
            disabled={currentStep === 'equipment'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          {currentStep === 'review' ? (
            <Button
              onClick={onComplete}
              disabled={!validateSelection.isValid}
              className="bg-green-600 hover:bg-green-700"
            >
              Concluir Seleção
            </Button>
          ) : (
            <Button
              onClick={() => {
                const steps: WizardStep[] = ['equipment', 'chip-association', 'backup-chips', 'review'];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex < steps.length - 1) {
                  setCurrentStep(steps[currentIndex + 1]);
                }
              }}
              disabled={!canProceedToNextStep()}
              className="bg-[#4D2BFB] hover:bg-[#4D2BFB]/90"
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
      
      {/* Modais */}
      <ResponsiveAssetModal
        open={showAssetModal}
        onOpenChange={setShowAssetModal}
        title="Selecionar Ativos"
        description="Busque e selecione os ativos desejados"
        selectedAssets={selectedAssets}
        onAssetSelected={handleAssetSelected}
        excludeAssociatedToClient={excludeAssociatedToClient}
        multipleSelection={true}
        onCancel={() => setShowAssetModal(false)}
      />
      
      {equipmentNeedingChip && (
        <ChipAssociationModal
          open={showChipModal}
          onOpenChange={setShowChipModal}
          equipment={equipmentNeedingChip}
          selectedAssets={selectedAssets}
          onChipSelected={handleChipSelected}
          onCancel={() => {
            setShowChipModal(false);
            setEquipmentNeedingChip(null);
          }}
        />
      )}
    </Card>
  );
};
