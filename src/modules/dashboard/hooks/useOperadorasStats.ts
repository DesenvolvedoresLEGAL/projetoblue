import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OperadoraStats {
  id: number;
  name: string;
  total: number;
  emUso: number;
  disponivel: number;
  disponibilidadePercent: number;
}

export const useOperadorasStats = () => {
  return useQuery({
    queryKey: ["operadoras-stats"],
    queryFn: async (): Promise<OperadoraStats[]> => {
      console.log("Buscando estatísticas de operadoras...");

      // Query otimizada com JOINs para buscar operadoras e suas estatísticas
      const { data, error } = await supabase
        .from("manufacturers")
        .select(`
          id,
          name,
          assets:assets!manufacturer_id(
            uuid,
            status_id,
            solution_id,
            asset_status!status_id(status),
            asset_solutions!solution_id(solution)
          )
        `)
        .eq("description", "Operadora")
        .is("deleted_at", null);

      if (error) {
        console.error("Erro ao buscar operadoras:", error);
        throw new Error(`Falha ao carregar dados das operadoras: ${error.message}`);
      }

      if (!data) {
        console.warn("Nenhuma operadora encontrada");
        return [];
      }

      // Processar dados e calcular estatísticas
      const operadorasStats: OperadoraStats[] = data.map((operadora) => {
        // Filtrar apenas SIM-cards (chips) desta operadora
        const chips = operadora.assets?.filter((asset: any) => 
          asset.asset_solutions?.solution === "CHIP"
        ) || [];

        const total = chips.length;
        
        // Calcular chips em uso (em locação + em assinatura)
        const emUso = chips.filter((chip: any) => {
          const status = chip.asset_status?.status?.toLowerCase();
          return status === "em locação" || status === "em assinatura";
        }).length;

        // Calcular chips disponíveis
        const disponivel = chips.filter((chip: any) => {
          const status = chip.asset_status?.status?.toLowerCase();
          return status === "disponível";
        }).length;

        const disponibilidadePercent = total > 0 ? Math.round((disponivel / total) * 100) : 0;

        return {
          id: operadora.id,
          name: operadora.name,
          total,
          emUso,
          disponivel,
          disponibilidadePercent
        };
      });

      console.log(`Processadas ${operadorasStats.length} operadoras`);
      return operadorasStats;
    },
    staleTime: 2 * 60 * 1000, // Cache por 2 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};