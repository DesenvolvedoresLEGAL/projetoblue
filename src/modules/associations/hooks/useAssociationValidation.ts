
import { useCallback } from 'react';
import { useIdempotentAssociation } from './useIdempotentAssociation';
import { ValidationResult } from '../services/idempotencyService';

export const useAssociationValidation = () => {
  const { validateOnly, validationResult, isValidating } = useIdempotentAssociation();

  /**
   * Valida se um asset pode ser associado
   */
  const validateForCreation = useCallback(async (assetId: string): Promise<ValidationResult> => {
    return await validateOnly(assetId, 'CREATE');
  }, [validateOnly]);

  /**
   * Valida se uma associação pode ser encerrada
   */
  const validateForTermination = useCallback(async (
    assetId: string, 
    associationId?: number
  ): Promise<ValidationResult> => {
    return await validateOnly(assetId, 'END', associationId);
  }, [validateOnly]);

  /**
   * Verifica se um asset está disponível para associação
   */
  const isAssetAvailable = useCallback((validation: ValidationResult | null): boolean => {
    if (!validation) return false;
    return validation.valid && validation.active_associations === 0;
  }, []);

  /**
   * Verifica se uma operação pode ser executada (não é um erro bloqueante)
   */
  const canProceed = useCallback((validation: ValidationResult | null): boolean => {
    if (!validation) return false;
    
    // Operação pode prosseguir se é válida OU se é um caso de idempotência permitida
    if (validation.valid) return true;
    
    const allowedIdempotentCodes = ['ASSET_ALREADY_ASSOCIATED', 'NO_ACTIVE_ASSOCIATION'];
    return allowedIdempotentCodes.includes(validation.error_code || '');
  }, []);

  /**
   * Obtém mensagem amigável para o usuário
   */
  const getFriendlyMessage = useCallback((validation: ValidationResult | null): string => {
    if (!validation) return 'Validação não realizada';
    
    if (validation.valid) return 'Operação pode ser realizada';
    
    switch (validation.error_code) {
      case 'ASSET_NOT_FOUND':
        return 'Ativo não encontrado';
      case 'ASSET_ALREADY_ASSOCIATED':
        return 'Ativo já possui uma associação ativa';
      case 'INVALID_STATUS_FOR_ASSOCIATION':
        return `Status atual (${validation.current_status}) não permite nova associação`;
      case 'NO_ACTIVE_ASSOCIATION':
        return 'Não há associação ativa para encerrar';
      case 'ASSOCIATION_NOT_FOUND':
        return 'Associação específica não encontrada';
      default:
        return validation.message || 'Erro na validação';
    }
  }, []);

  return {
    validateForCreation,
    validateForTermination,
    isAssetAvailable,
    canProceed,
    getFriendlyMessage,
    validationResult,
    isValidating
  };
};
