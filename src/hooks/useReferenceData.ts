
import { useQueries } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Hook para buscar todos os dados de referência de uma vez
export function useReferenceData() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["manufacturers"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("manufacturers")
            .select("id, name")
            .order("name");
          if (error) throw error;
          return data || [];
        },
        placeholderData: [],
      },
      {
        queryKey: ["plans"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("plans")
            .select("id, nome, tamanho_gb")
            .order("nome");
          if (error) throw error;
          return data || [];
        },
        placeholderData: [],
      },
      {
        queryKey: ["asset_status"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("asset_status")
            .select("id, status")
            .order("status");
          if (error) throw error;
          return data || [];
        },
        placeholderData: [],
      },
      {
        queryKey: ["asset_solutions"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("asset_solutions")
            .select("id, solution")
            .order("solution");
          if (error) throw error;
          return data || [];
        },
        placeholderData: [],
      },
    ],
  });

  return {
    manufacturers: results[0].data || [],
    plans: results[1].data || [],
    assetStatus: results[2].data || [],
    assetSolutions: results[3].data || [],
    isLoading: results.some(result => result.isLoading),
  };
}
