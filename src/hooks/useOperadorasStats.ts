
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OperadoraStats {
  id: number;
  name: string;
  total: number;
  emUso: number;
  disponiveis: number;
}

export const useOperadorasStats = () => {
  return useQuery({
    queryKey: ['operadoras-stats'],
    queryFn: async (): Promise<OperadoraStats[]> => {
      console.log('🔍 Buscando estatísticas das operadoras...');

      // Buscar operadoras
      const { data: operadoras, error: operadorasError } = await supabase
        .from('manufacturers')
        .select('id, name')
        .ilike('description', 'operadora')
        .is('deleted_at', null);

      if (operadorasError) {
        console.error('Erro ao buscar operadoras:', operadorasError);
        throw operadorasError;
      }

      if (!operadoras || operadoras.length === 0) {
        console.warn('Nenhuma operadora encontrada');
        return [];
      }

      console.log('Operadoras encontradas:', operadoras);

      // Buscar status IDs
      const { data: statusData, error: statusError } = await supabase
        .from('asset_status')
        .select('id, status')
        .is('deleted_at', null);

      if (statusError) {
        console.error('Erro ao buscar status:', statusError);
        throw statusError;
      }

      const statusDisponivel = statusData?.find(s => 
        s.status.toLowerCase().includes('disponível') || 
        s.status.toLowerCase().includes('disponivel')
      )?.id;

      const statusEmLocacao = statusData?.find(s => 
        s.status.toLowerCase().includes('locação') || 
        s.status.toLowerCase().includes('locacao')
      )?.id;

      const statusEmAssinatura = statusData?.find(s => 
        s.status.toLowerCase().includes('assinatura')
      )?.id;

      console.log('Status IDs:', { statusDisponivel, statusEmLocacao, statusEmAssinatura });

      // Buscar solution ID para CHIPs
      const { data: solutionData, error: solutionError } = await supabase
        .from('asset_solutions')
        .select('id')
        .ilike('solution', 'chip')
        .is('deleted_at', null)
        .single();

      if (solutionError) {
        console.error('Erro ao buscar solution CHIP:', solutionError);
        throw solutionError;
      }

      const chipSolutionId = solutionData?.id;
      console.log('CHIP Solution ID:', chipSolutionId);

      // Para cada operadora, buscar estatísticas
      const statsPromises = operadoras.map(async (operadora) => {
        const { data: assets, error: assetsError } = await supabase
          .from('assets')
          .select('status_id')
          .eq('manufacturer_id', operadora.id)
          .eq('solution_id', chipSolutionId)
          .is('deleted_at', null);

        if (assetsError) {
          console.error(`Erro ao buscar assets para ${operadora.name}:`, assetsError);
          return {
            id: operadora.id,
            name: operadora.name,
            total: 0,
            emUso: 0,
            disponiveis: 0
          };
        }

        const total = assets?.length || 0;
        const disponiveis = assets?.filter(a => a.status_id === statusDisponivel).length || 0;
        const emUso = assets?.filter(a => 
          a.status_id === statusEmLocacao || a.status_id === statusEmAssinatura
        ).length || 0;

        console.log(`Stats para ${operadora.name}:`, { total, emUso, disponiveis });

        return {
          id: operadora.id,
          name: operadora.name,
          total,
          emUso,
          disponiveis
        };
      });

      const results = await Promise.all(statsPromises);
      console.log('Resultados finais:', results);

      return results.filter(r => r.total > 0); // Só retornar operadoras com chips
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false,
  });
};
