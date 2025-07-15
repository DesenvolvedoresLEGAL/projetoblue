
import { useMemo } from 'react';
import { SelectedAsset, AssetValidationResult } from '../types';
import { useAssetBusinessRules } from './useAssetBusinessRules';

interface UseAssociationValidationProps {
  selectedAssets: SelectedAsset[];
}

export const useAssociationValidation = ({ selectedAssets }: UseAssociationValidationProps) => {
  const { validateSelection } = useAssetBusinessRules(selectedAssets);
  
  const validationResult: AssetValidationResult = useMemo(() => {
    return validateSelection;
  }, [validateSelection]);

  const isValidating = false; // Para manter compatibilidade
  const validateOnly = () => validationResult; // Para manter compatibilidade

  return {
    validationResult,
    isValidating,
    validateOnly
  };
};
