
import { useState, useCallback } from 'react';
import { idempotencyService, OperationLockResult, ValidationResult } from '../services/idempotencyService';
import { toast } from '@/utils/toast';

interface IdempotentOperationState {
  isValidating: boolean;
  isLocked: boolean;
  lockId: string | null;
  validationResult: ValidationResult | null;
  lockResult: OperationLockResult | null;
}

export const useIdempotentAssociation = () => {
  const [state, setState] = useState<IdempotentOperationState>({
    isValidating: false,
    isLocked: false,
    lockId: null,
    validationResult: null,
    lockResult: null
  });

  /**
   * Executa uma operação de associação com validação e lock automático
   */
  const executeWithIdempotency = useCallback(async <T>(
    assetId: string,
    operation: 'CREATE' | 'END',
    operationCallback: () => Promise<T>,
    associationId?: number,
    operationType?: string
  ): Promise<T | null> => {
    const lockType = operationType || `${operation}_ASSOCIATION`;
    
    try {
      setState(prev => ({ ...prev, isValidating: true }));

      // 1. Validar estado atual
      console.log(`🔍 Validating ${operation} operation for asset ${assetId}`);
      const validation = await idempotencyService.validateAssociationState(
        assetId,
        operation,
        associationId
      );

      setState(prev => ({ ...prev, validationResult: validation }));

      if (!validation.valid) {
        // Verificar se é um caso de idempotência permitida
        const allowedIdempotentCodes = ['ASSET_ALREADY_ASSOCIATED', 'NO_ACTIVE_ASSOCIATION'];
        
        if (allowedIdempotentCodes.includes(validation.error_code || '')) {
          console.log(`⚠️ Idempotent operation detected: ${validation.message}`);
          toast.info(`Operação já realizada: ${validation.message}`);
          return null; // Operação idempotente - não é erro
        }
        
        throw new Error(`Validação falhou: ${validation.message}`);
      }

      // 2. Adquirir lock
      console.log(`🔒 Acquiring lock for ${lockType} on ${assetId}`);
      const lockResult = await idempotencyService.acquireOperationLock(
        lockType,
        assetId,
        { operation, associationId, timestamp: new Date().toISOString() }
      );

      setState(prev => ({ 
        ...prev, 
        lockResult,
        isLocked: lockResult.acquired,
        lockId: lockResult.lock_id || null
      }));

      if (!lockResult.acquired) {
        if (lockResult.error_code === 'RESOURCE_LOCKED') {
          throw new Error('Recurso está sendo usado por outro usuário. Tente novamente em alguns instantes.');
        }
        throw new Error(`Erro ao adquirir lock: ${lockResult.message}`);
      }

      // 3. Executar operação
      console.log(`⚡ Executing ${operation} operation for asset ${assetId}`);
      const result = await operationCallback();

      console.log(`✅ Operation ${operation} completed successfully for asset ${assetId}`);
      return result;

    } catch (error) {
      console.error(`❌ Error in ${operation} operation for asset ${assetId}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      
      throw error;
    } finally {
      // 4. Liberar lock sempre
      if (state.lockId) {
        console.log(`🔓 Releasing lock ${state.lockId}`);
        await idempotencyService.releaseOperationLock(state.lockId);
      }

      setState(prev => ({
        ...prev,
        isValidating: false,
        isLocked: false,
        lockId: null
      }));
    }
  }, [state.lockId]);

  /**
   * Valida estado sem executar operação
   */
  const validateOnly = useCallback(async (
    assetId: string,
    operation: 'CREATE' | 'END',
    associationId?: number
  ): Promise<ValidationResult> => {
    setState(prev => ({ ...prev, isValidating: true }));
    
    try {
      const validation = await idempotencyService.validateAssociationState(
        assetId,
        operation,
        associationId
      );
      
      setState(prev => ({ ...prev, validationResult: validation }));
      return validation;
    } finally {
      setState(prev => ({ ...prev, isValidating: false }));
    }
  }, []);

  /**
   * Limpa estado atual
   */
  const clearState = useCallback(() => {
    setState({
      isValidating: false,
      isLocked: false,
      lockId: null,
      validationResult: null,
      lockResult: null
    });
  }, []);

  return {
    ...state,
    executeWithIdempotency,
    validateOnly,
    clearState
  };
};
