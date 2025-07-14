
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

  // Lógica melhorada para detectar associações pendentes
  const findPendingAssociations = () => {
    const equipmentsThatNeedChip = selectedAssets.filter(needsChip);
    const availableChips = selectedAssets.filter(isChip);
    
    console.log('Equipamentos que precisam de CHIP:', equipmentsThatNeedChip.map(e => e.radio || e.model));
    console.log('CHIPs disponíveis:', availableChips.map(c => c.line_number || c.iccid));

    const associations = new Map<string, string>(); // equipmentId -> chipId
    
    // Primeiro, mapear associações já salvas
    equipmentsThatNeedChip.forEach(equipment => {
      const directlyAssociatedChip = availableChips.find(chip => 
        chip.associatedEquipmentId === equipment.uuid
      );
      
      if (directlyAssociatedChip) {
        associations.set(equipment.uuid, directlyAssociatedChip.uuid);
        console.log(`Associação direta encontrada: ${equipment.radio || equipment.model} -> ${directlyAssociatedChip.line_number || directlyAssociatedChip.iccid}`);
      }
    });

    // Em seguida, fazer matching automático para equipamentos sem associação
    const unassignedEquipments = equipmentsThatNeedChip.filter(equipment => 
      !associations.has(equipment.uuid)
    );
    
    const unassignedChips = availableChips.filter(chip => 
      !chip.associatedEquipmentId && 
      !Array.from(associations.values()).includes(chip.uuid)
    );

    console.log('Equipamentos sem associação:', unassignedEquipments.map(e => e.radio || e.model));
    console.log('CHIPs sem associação:', unassignedChips.map(c => c.line_number || c.iccid));

    // Fazer matching automático
    unassignedEquipments.forEach((equipment, index) => {
      if (index < unassignedChips.length) {
        const chip = unassignedChips[index];
        associations.set(equipment.uuid, chip.uuid);
        console.log(`Matching automático: ${equipment.radio || equipment.model} -> ${chip.line_number || chip.iccid}`);
      }
    });

    return associations;
  };

  // Valida a seleção atual de assets com lógica melhorada
  const validateSelection = useMemo((): AssetValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    console.log('=== INÍCIO DA VALIDAÇÃO ===');
    console.log('Assets selecionados:', selectedAssets.map(a => ({
      uuid: a.uuid,
      type: a.type,
      radio: a.radio,
      model: a.model,
      line_number: a.line_number,
      iccid: a.iccid,
      solution_id: a.solution_id,
      associatedEquipmentId: a.associatedEquipmentId,
      associatedChipId: a.associatedChipId
    })));

    const equipmentsThatNeedChip = selectedAssets.filter(needsChip);
    const selectedChips = selectedAssets.filter(isChip);

    console.log(`Equipamentos que precisam de CHIP: ${equipmentsThatNeedChip.length}`);
    console.log(`CHIPs selecionados: ${selectedChips.length}`);

    // Usar a nova lógica de associações pendentes
    const pendingAssociations = findPendingAssociations();
    
    // Validar cada equipamento
    equipmentsThatNeedChip.forEach(equipment => {
      const equipmentName = equipment.radio || equipment.model || equipment.uuid;
      const hasAssociation = pendingAssociations.has(equipment.uuid);
      
      console.log(`Validando equipamento ${equipmentName}: tem associação = ${hasAssociation}`);
      
      if (!hasAssociation) {
        errors.push(`${equipmentName} precisa ser associado a um CHIP`);
        suggestions.push(`Selecione um CHIP para associar ao ${equipmentName}`);
      }
    });

    // Verificar se há CHIPs suficientes
    const availableChipsCount = selectedChips.filter(chip => 
      !chip.associatedEquipmentId || 
      equipmentsThatNeedChip.some(eq => eq.uuid === chip.associatedEquipmentId)
    ).length;

    const equipmentsNeedingChipCount = equipmentsThatNeedChip.length;

    console.log(`CHIPs disponíveis: ${availableChipsCount}, Equipamentos precisando: ${equipmentsNeedingChipCount}`);

    if (equipmentsNeedingChipCount > 0 && availableChipsCount >= equipmentsNeedingChipCount) {
      // Se há CHIPs suficientes, considerar válido mesmo sem associações explícitas salvas
      const validAssociations = equipmentsNeedingChipCount <= availableChipsCount;
      
      if (validAssociations && errors.length > 0) {
        // Limpar erros se há matching possível
        errors.length = 0;
        suggestions.push('As associações entre equipamentos e CHIPs serão configuradas automaticamente');
      }
    }

    // CHIPs sem associação (considerar como backup)
    selectedChips.forEach(chip => {
      const chipName = chip.line_number || chip.iccid || chip.uuid;
      const isAssociated = Array.from(pendingAssociations.values()).includes(chip.uuid);
      
      if (!isAssociated && !chip.isPrincipalChip) {
        warnings.push(`CHIP ${chipName} será considerado como backup`);
      }
    });

    const isValid = errors.length === 0;
    
    console.log('=== RESULTADO DA VALIDAÇÃO ===');
    console.log('Válido:', isValid);
    console.log('Erros:', errors);
    console.log('Avisos:', warnings);
    console.log('Sugestões:', suggestions);
    console.log('=== FIM DA VALIDAÇÃO ===');

    return {
      isValid,
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
