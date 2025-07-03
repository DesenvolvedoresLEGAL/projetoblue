
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OperadoraStats {
  id: number;
  nome: string;
  total: number;
  disponivel: number;
  em_locacao: number;
  em_assinatura: number;
  com_problema: number;
  percentual_disponivel: number;
}

export const useOperadorasStats = () => {
  return useQuery({
    queryKey: ['operadoras-stats'],
    queryFn: async (): Promise<OperadoraStats[]> => {
      if (import.meta.env.DEV) console.log('[useOperadorasStats] Buscando dados das operadoras...');

      // Buscar operadoras (manufacturers com description = 'Operadora')
      const { data: operadoras, error: operadorasError } = await supabase
        .from('manufacturers')
        .select('id, name')
        .eq('description', 'Operadora')
        .is('deleted_at', null);

      if (operadorasError) {
        if (import.meta.env.DEV) console.error('[useOperadorasStats] Erro ao buscar operadoras:', operadorasError);
        throw operadorasError;
      }

      if (import.meta.env.DEV) console.log('[useOperadorasStats] Operadoras encontradas:', operadoras);

      // Para cada operadora, buscar estatísticas dos chips
      const stats: OperadoraStats[] = [];

      for (const operadora of operadoras || []) {
        const { data: assets, error: assetsError } = await supabase
          .from('assets')
          .select(`
            uuid,
            status_id,
            manufacturer_id,
            solution_id,
            asset_status!inner(id, status)
          `)
          .eq('manufacturer_id', operadora.id)
          .eq('solution_id', 11) // Chips (solution_id = 11)
          .is('deleted_at', null);

        if (assetsError) {
          if (import.meta.env.DEV) console.error(`[useOperadorasStats] Erro ao buscar assets da operadora ${operadora.name}:`, assetsError);
          continue;
        }

        // Contar por status
        const total = assets?.length || 0;
        const disponivel = assets?.filter(a => a.asset_status?.status?.toLowerCase() === 'disponível').length || 0;
        const em_locacao = assets?.filter(a => a.asset_status?.status?.toLowerCase() === 'em locação').length || 0;
        const em_assinatura = assets?.filter(a => a.asset_status?.status?.toLowerCase() === 'em assinatura').length || 0;
        const com_problema = assets?.filter(a => a.asset_status?.status?.toLowerCase() === 'com problema').length || 0;
        
        const percentual_disponivel = total > 0 ? Math.round((disponivel / total) * 100) : 0;

        stats.push({
          id: operadora.id,
          nome: operadora.name,
          total,
          disponivel,
          em_locacao,
          em_assinatura,
          com_problema,
          percentual_disponivel
        });

        if (import.meta.env.DEV) console.log(`[useOperadorasStats] Stats ${operadora.name}:`, {
          total,
          disponivel,
          em_locacao,
          em_assinatura,
          com_problema,
          percentual_disponivel
        });
      }

      return stats;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
    enabled: true,
  });
};
