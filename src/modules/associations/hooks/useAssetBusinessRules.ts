
import { useMemo } from 'react';
import { SelectedAsset, AssetBusinessRules, AssetValidationResult } from '../types';

// IDs das soluções que precisam de CHIP
const EQUIPMENT_NEEDS_CHIP = [1, 2, 4]; // SPEEDY 5G, 4BLACK, 4PLUS
const CHIP_SOLUTION_ID = 11;

export const useAssetBusinessRules = (selectedAssets: SelectedAsset[] = []) => {
  
  // Determina se um asset precisa de CHIP baseado no solution_id
  const needsChip = (asset: SelectedAsset): boolean => {
    return EQUIPMENT_NEEDS_CHIP.includes(asset.solution_id || 0);
  };

  // Determina se um asset é um CHIP
  const isChip = (asset: SelectedAsset): boolean => {
    return asset.solution_id === CHIP_SOLUTION_ID;
  };

  // Determina se um asset pode ser associado sozinho
  const canBeAssociatedAlone = (asset: SelectedAsset): boolean => {
    return !needsChip(asset);
  };

  // Encontra CHIPs compatíveis para um equipamento
  const findCompatibleChips = (forEquipment: SelectedAsset, availableAssets: SelectedAsset[]): SelectedAsset[] => {
    if (!needsChip(forEquipment)) return [];
    
    return availableAssets.filter(asset => 
      isChip(asset) && 
      asset.statusId === 1 && // Disponível
      !selectedAssets.some(selected => selected.uuid === asset.uuid) // Não já selecionado
    );
  };

  // Encontra equipamentos compatíveis para um CHIP
  const findCompatibleEquipments = (forChip: SelectedAsset, availableAssets: SelectedAsset[]): SelectedAsset[] => {
    if (!isChip(forChip)) return [];
    
    return availableAssets.filter(asset => 
      needsChip(asset) && 
      asset.statusId === 1 && // Disponível
      !selectedAssets.some(selected => selected.uuid === asset.uuid) // Não já selecionado
    );
  };

  // Valida a seleção atual de assets
  const validateSelection = useMemo((): AssetValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const equipmentsThatNeedChip = selectedAssets.filter(needsChip);
    const selectedChips = selectedAssets.filter(isChip);

    // Validar equipamentos que precisam de CHIP
    equipmentsThatNeedChip.forEach(equipment => {
      const equipmentName = equipment.radio || equipment.model || equipment.uuid;
      const hasAssociatedChip = selectedChips.some(chip => 
        chip.associatedEquipmentId === equipment.uuid
      );

      if (!hasAssociatedChip) {
        errors.push(`${equipmentName} precisa ser associado a um CHIP`);
        suggestions.push(`Selecione um CHIP para associar ao ${equipmentName}`);
      }
    });

    // Validar CHIPs sem equipamento (devem ser marcados como backup)
    selectedChips.forEach(chip => {
      const chipName = chip.line_number || chip.iccid || chip.uuid;
      if (!chip.associatedEquipmentId && !chip.isPrincipalChip) {
        warnings.push(`CHIP ${chipName} será considerado como backup`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }, [selectedAssets]);

  // Retorna regras para um asset específico
  const getAssetRules = (asset: SelectedAsset): AssetBusinessRules => ({
    needsChip: needsChip(asset),
    isChip: isChip(asset),
    canBeAssociatedAlone: canBeAssociatedAlone(asset)
  });

  return {
    needsChip,
    isChip,
    canBeAssociatedAlone,
    findCompatibleChips,
    findCompatibleEquipments,
    validateSelection,
    getAssetRules,
    EQUIPMENT_NEEDS_CHIP,
    CHIP_SOLUTION_ID
  };
};
