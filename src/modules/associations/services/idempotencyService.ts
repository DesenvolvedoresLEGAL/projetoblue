
import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  valid: boolean;
  error_code?: string;
  message: string;
  asset_id: string;
  current_status?: string;
  current_status_id?: number;
  active_associations?: number;
}

export interface OperationLockResult {
  acquired: boolean;
  lock_id?: string;
  renewed?: boolean;
  expires_at?: string;
  error_code?: string;
  message?: string;
  lock_owner?: string;
}

/**
 * Serviço para validação de estado de associações e controle de idempotência
 */
export const idempotencyService = {
  /**
   * Valida se uma operação de associação pode ser executada
   */
  async validateAssociationState(
    assetId: string,
    operation: 'CREATE' | 'END',
    associationId?: number
  ): Promise<ValidationResult> {
    try {
      const { data, error } = await supabase.rpc('validate_association_state', {
        p_asset_id: assetId,
        p_operation: operation,
        p_association_id: associationId || null
      });

      if (error) {
        console.error('Error validating association state:', error);
        return {
          valid: false,
          error_code: 'VALIDATION_ERROR',
          message: 'Erro ao validar estado da associação',
          asset_id: assetId
        };
      }

      return data as unknown as ValidationResult;
    } catch (error) {
      console.error('Exception validating association state:', error);
      return {
        valid: false,
        error_code: 'VALIDATION_EXCEPTION',
        message: 'Erro interno na validação',
        asset_id: assetId
      };
    }
  },

  /**
   * Adquire um lock para operação em recurso
   */
  async acquireOperationLock(
    operationType: string,
    resourceId: string,
    operationData?: Record<string, unknown>,
    timeoutMinutes: number = 5
  ): Promise<OperationLockResult> {
    try {
      const { data, error } = await supabase.rpc('acquire_operation_lock', {
        p_operation_type: operationType,
        p_resource_id: resourceId,
        p_operation_data: operationData || null,
        p_timeout_minutes: timeoutMinutes
      });

      if (error) {
        console.error('Error acquiring operation lock:', error);
        return {
          acquired: false,
          error_code: 'LOCK_ERROR',
          message: 'Erro ao adquirir lock de operação'
        };
      }

      return data as unknown as OperationLockResult;
    } catch (error) {
      console.error('Exception acquiring operation lock:', error);
      return {
        acquired: false,
        error_code: 'LOCK_EXCEPTION',
        message: 'Erro interno ao adquirir lock'
      };
    }
  },

  /**
   * Libera um lock de operação
   */
  async releaseOperationLock(lockId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('release_operation_lock', {
        p_lock_id: lockId
      });

      if (error) {
        console.error('Error releasing operation lock:', error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error('Exception releasing operation lock:', error);
      return false;
    }
  },

  /**
   * Limpa locks expirados
   */
  async cleanupExpiredLocks(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_locks');

      if (error) {
        console.error('Error cleaning up expired locks:', error);
        return 0;
      }

      return data as number;
    } catch (error) {
      console.error('Exception cleaning up expired locks:', error);
      return 0;
    }
  }
};
