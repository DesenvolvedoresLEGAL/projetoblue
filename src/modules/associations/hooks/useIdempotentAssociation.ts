
import { useState } from 'react';
import { idempotencyService, ValidationResult } from '@/services/idempotencyService';

export const useIdempotentAssociation = () => {
  const [executingOperations, setExecutingOperations] = useState<Set<string>>(new Set());
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const executeWithIdempotency = async <T>(
    operationKey: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    console.log('[useIdempotentAssociation] Executando operação com chave:', operationKey);

    // Verificar se a operação já está em execução
    if (executingOperations.has(operationKey)) {
      console.log('[useIdempotentAssociation] Operação já em execução, aguardando...');
      throw new Error('Operação já está em execução. Aguarde...');
    }

    // Verificar cache de idempotência
    const cachedResult = idempotencyService.getCachedResult<T>(operationKey);
    if (cachedResult !== null) {
      console.log('[useIdempotentAssociation] Resultado encontrado em cache:', cachedResult);
      return cachedResult;
    }

    // Marcar operação como em execução
    setExecutingOperations(prev => new Set([...prev, operationKey]));

    try {
      console.log('[useIdempotentAssociation] Executando operação...');
      const result = await operation();
      
      // Cachear resultado de sucesso
      idempotencyService.cacheResult(operationKey, result);
      console.log('[useIdempotentAssociation] Operação concluída com sucesso');
      
      return result;
    } catch (error) {
      console.error('[useIdempotentAssociation] Erro na operação:', error);
      
      // Para alguns tipos de erro, também cachear para evitar retry imediato
      if (error instanceof Error && (
        error.message.includes('ASSET_ALREADY_ASSOCIATED') ||
        error.message.includes('ASSET_NOT_FOUND') ||
        error.message.includes('CLIENT_NOT_FOUND')
      )) {
        console.log('[useIdempotentAssociation] Cacheando erro para evitar retry:', error.message);
        idempotencyService.cacheResult(operationKey, { error: error.message });
      }
      
      throw error;
    } finally {
      // Remover operação da lista de execução
      setExecutingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(operationKey);
        return newSet;
      });
    }
  };

  const validateOnly = async (assetId: string, operation: 'CREATE' | 'END', associationId?: number): Promise<ValidationResult> => {
    setIsValidating(true);
    try {
      // Simular validação - substituir pela lógica real de validação
      const result: ValidationResult = {
        valid: true,
        message: 'Operação válida',
        active_associations: 0,
        current_status: 'DISPONÍVEL'
      };
      
      setValidationResult(result);
      return result;
    } catch (error) {
      const errorResult: ValidationResult = {
        valid: false,
        message: error instanceof Error ? error.message : 'Erro na validação',
        active_associations: 0,
        current_status: 'UNKNOWN'
      };
      
      setValidationResult(errorResult);
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  };

  const clearOperationCache = (operationKey: string) => {
    console.log('[useIdempotentAssociation] Limpando cache da operação:', operationKey);
    idempotencyService.clearCache(operationKey);
  };

  const isOperationExecuting = (operationKey: string): boolean => {
    return executingOperations.has(operationKey);
  };

  return {
    executeWithIdempotency,
    clearOperationCache,
    isOperationExecuting,
    validateOnly,
    validationResult,
    isValidating
  };
};
