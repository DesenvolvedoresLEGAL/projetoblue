
import { useState } from 'react';
import { idempotencyService } from '@/services/idempotencyService';

export const useIdempotentAssociation = () => {
  const [executingOperations, setExecutingOperations] = useState<Set<string>>(new Set());

  const executeWithIdempotency = async <T>(
    operationKey: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    if (import.meta.env.DEV) console.log('[useIdempotentAssociation] Executando operação com chave:', operationKey);

    // Verificar se a operação já está em execução
    if (executingOperations.has(operationKey)) {
      if (import.meta.env.DEV) console.log('[useIdempotentAssociation] Operação já em execução, aguardando...');
      throw new Error('Operação já está em execução. Aguarde...');
    }

    // Verificar cache de idempotência
    const cachedResult = idempotencyService.getCachedResult<T>(operationKey);
    if (cachedResult !== null) {
      if (import.meta.env.DEV) console.log('[useIdempotentAssociation] Resultado encontrado em cache:', cachedResult);
      return cachedResult;
    }

    // Marcar operação como em execução
    setExecutingOperations(prev => new Set([...prev, operationKey]));

    try {
      if (import.meta.env.DEV) console.log('[useIdempotentAssociation] Executando operação...');
      const result = await operation();
      
      // Cachear resultado de sucesso
      idempotencyService.cacheResult(operationKey, result);
      if (import.meta.env.DEV) console.log('[useIdempotentAssociation] Operação concluída com sucesso');
      
      return result;
    } catch (error) {
      if (import.meta.env.DEV) console.error('[useIdempotentAssociation] Erro na operação:', error);

      // Não cachear erros para permitir nova tentativa em seguida
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

  const clearOperationCache = (operationKey: string) => {
    if (import.meta.env.DEV) console.log('[useIdempotentAssociation] Limpando cache da operação:', operationKey);
    idempotencyService.clearCache(operationKey);
  };

  const isOperationExecuting = (operationKey: string): boolean => {
    return executingOperations.has(operationKey);
  };

  return {
    executeWithIdempotency,
    clearOperationCache,
    isOperationExecuting
  };
};
