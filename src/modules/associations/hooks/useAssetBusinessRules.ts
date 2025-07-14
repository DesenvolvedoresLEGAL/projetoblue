
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
      
      // Primeiro, verificar se já tem associação salva
      const hasDirectAssociation = selectedChips.some(chip => 
        chip.associatedEquipmentId === equipment.uuid
      );

      // Se não tem associação direta, verificar se há CHIPs disponíveis para associação pendente
      const availableChipsForEquipment = selectedChips.filter(chip => 
        !chip.associatedEquipmentId && // CHIP não está associado a outro equipamento
        chip.statusId === 1 // CHIP está disponível
      );

      // Verificar se este equipamento já tem um CHIP "reservado" para ele
      const hasReservedChip = availableChipsForEquipment.length > 0;

      if (!hasDirectAssociation && !hasReservedChip) {
        errors.push(`${equipmentName} precisa ser associado a um CHIP`);
        suggestions.push(`Selecione um CHIP para associar ao ${equipmentName}`);
      } else if (!hasDirectAssociation && hasReservedChip) {
        // Há CHIPs disponíveis, mas a associação ainda não foi configurada
        warnings.push(`${equipmentName} tem CHIP disponível, mas a associação ainda não foi configurada`);
      }
    });

    // Validar CHIPs sem equipamento (devem ser marcados como backup)
    selectedChips.forEach(chip => {
      const chipName = chip.line_number || chip.iccid || chip.uuid;
      
      // CHIP não está associado e não é principal
      if (!chip.associatedEquipmentId && !chip.isPrincipalChip) {
        // Verificar se há equipamentos disponíveis que precisam de CHIP
        const equipmentsNeedingChip = equipmentsThatNeedChip.filter(equipment => 
          !selectedChips.some(c => c.associatedEquipmentId === equipment.uuid)
        );

        if (equipmentsNeedingChip.length > 0) {
          suggestions.push(`CHIP ${chipName} pode ser associado a um dos equipamentos selecionados`);
        } else {
          warnings.push(`CHIP ${chipName} será considerado como backup`);
        }
      }
    });

    // Lógica melhorada: se há equipamentos que precisam de CHIP e há CHIPs disponíveis,
    // considerar válido mesmo sem associação explícita salva
    const equipmentsWithoutChip = equipmentsThatNeedChip.filter(equipment => {
      const hasDirectAssociation = selectedChips.some(chip => 
        chip.associatedEquipmentId === equipment.uuid
      );
      return !hasDirectAssociation;
    });

    const availableChips = selectedChips.filter(chip => 
      !chip.associatedEquipmentId && chip.statusId === 1
    );

    // Se há equipamentos sem CHIP mas há CHIPs disponíveis, considerar como válido
    if (equipmentsWithoutChip.length > 0 && availableChips.length >= equipmentsWithoutChip.length) {
      // Remover erros relacionados a equipamentos sem CHIP quando há CHIPs disponíveis
      const updatedErrors = errors.filter(error => 
        !equipmentsWithoutChip.some(equipment => {
          const equipmentName = equipment.radio || equipment.model || equipment.uuid;
          return error.includes(equipmentName) && error.includes('precisa ser associado a um CHIP');
        })
      );
      
      // Adicionar sugestão para configurar as associações
      if (updatedErrors.length !== errors.length) {
        suggestions.push('Configure as associações entre equipamentos e CHIPs nas configurações de cada ativo');
      }

      return {
        isValid: updatedErrors.length === 0,
        errors: updatedErrors,
        warnings,
        suggestions
      };
    }

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
    canBeAssociated: canBeAssociatedAlone(asset),
    isPrincipal: asset.isPrincipalChip || false,
    isBackup: !asset.isPrincipalChip && isChip(asset),
    requiredFields: []
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
