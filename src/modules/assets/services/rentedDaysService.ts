
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';

export interface RentedDaysUpdateResult {
  success: boolean;
  asset_id: string;
  historical_days: number;
  calculated_days: number;
  total_days: number;
  periods_processed: number;
  updated: boolean;
  message?: string;
  error?: string;
}

export interface BatchUpdateResult {
  success: boolean;
  total_processed: number;
  total_updated: number;
  total_errors: number;
  execution_timestamp: string;
  errors?: any[];
  error?: string;
}

export interface IntegrityCheckResult {
  asset_id: string;
  current_rented_days: number;
  calculated_days: number;
  is_consistent: boolean;
  message: string;
}

export const rentedDaysService = {
  /**
   * Atualiza rented_days para um ativo específico
   */
  async updateAssetRentedDays(assetUuid: string): Promise<RentedDaysUpdateResult | null> {
    try {
      console.log(`Atualizando rented_days para ativo: ${assetUuid}`);
      
      const { data, error } = await supabase.rpc('update_asset_rented_days', {
        asset_uuid: assetUuid
      });

      if (error) {
        console.error('Erro ao atualizar rented_days:', error);
        toast.error(`Erro ao atualizar dias alugados: ${error.message}`);
        throw error;
      }

      const result = data as RentedDaysUpdateResult;
      
      if (result.success) {
        if (result.updated) {
          toast.success(`Dias alugados atualizados: ${result.total_days} dias (${result.historical_days} histórico + ${result.calculated_days} calculado)`);
        } else {
          toast.info(`Ativo já possui valor correto: ${result.total_days} dias`);
        }
      } else {
        toast.error(`Erro: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('Erro ao chamar update_asset_rented_days:', error);
      toast.error('Erro ao atualizar dias alugados');
      return null;
    }
  },

  /**
   * Atualiza rented_days para todos os ativos
   */
  async updateAllRentedDays(): Promise<BatchUpdateResult | null> {
    try {
      console.log('Iniciando atualização em lote de rented_days...');
      toast.info('Processamento iniciado. Isso pode levar alguns minutos...');
      
      const { data, error } = await supabase.rpc('update_all_rented_days');

      if (error) {
        console.error('Erro ao executar update em lote:', error);
        toast.error(`Erro no processamento em lote: ${error.message}`);
        throw error;
      }

      const result = data as BatchUpdateResult;
      
      if (result.success) {
        toast.success(`Processamento concluído: ${result.total_processed} ativos processados, ${result.total_updated} atualizados, ${result.total_errors} erros`);
        
        if (result.total_errors > 0) {
          console.warn('Erros encontrados durante o processamento:', result.errors);
          toast.warning(`${result.total_errors} ativos apresentaram erros. Verifique o console para detalhes.`);
        }
      } else {
        toast.error(`Erro no processamento: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('Erro ao chamar update_all_rented_days:', error);
      toast.error('Erro no processamento em lote');
      return null;
    }
  },

  /**
   * Valida integridade dos dados de rented_days
   */
  async validateIntegrity(): Promise<IntegrityCheckResult[]> {
    try {
      console.log('Validando integridade dos dados de rented_days...');
      
      const { data, error } = await supabase.rpc('validate_rented_days_integrity');

      if (error) {
        console.error('Erro ao validar integridade:', error);
        toast.error(`Erro na validação: ${error.message}`);
        throw error;
      }

      const results = data as IntegrityCheckResult[];
      
      const inconsistentCount = results.filter(r => !r.is_consistent).length;
      
      if (inconsistentCount > 0) {
        toast.warning(`${inconsistentCount} de ${results.length} ativos verificados apresentam inconsistências`);
      } else {
        toast.success(`Todos os ${results.length} ativos verificados estão consistentes`);
      }

      return results;
    } catch (error) {
      console.error('Erro ao chamar validate_rented_days_integrity:', error);
      toast.error('Erro na validação de integridade');
      return [];
    }
  },

  /**
   * Busca estatísticas resumidas sobre rented_days
   */
  async getRentedDaysStats(): Promise<{
    total_assets: number;
    assets_with_rented_days: number;
    max_rented_days: number;
    avg_rented_days: number;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('rented_days')
        .is('deleted_at', null);

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
      }

      const totalAssets = data.length;
      const assetsWithRentedDays = data.filter(a => a.rented_days > 0).length;
      const rentedDaysValues = data.map(a => a.rented_days || 0);
      const maxRentedDays = Math.max(...rentedDaysValues);
      const avgRentedDays = rentedDaysValues.reduce((sum, val) => sum + val, 0) / totalAssets;

      return {
        total_assets: totalAssets,
        assets_with_rented_days: assetsWithRentedDays,
        max_rented_days: maxRentedDays,
        avg_rented_days: Math.round(avgRentedDays * 100) / 100
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de rented_days:', error);
      return null;
    }
  }
};
