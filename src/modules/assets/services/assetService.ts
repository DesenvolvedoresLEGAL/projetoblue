
import { supabase } from "@/integrations/supabase/client";

export const assetService = {
  listProblemAssets: async () => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .neq('status_id', 1)
      .is('deleted_at', null);
    
    if (error) throw error;
    return data || [];
  },

  getAssetsByStatus: async (statusId: number) => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('status_id', statusId)
      .is('deleted_at', null);
    
    if (error) throw error;
    return data || [];
  }
};
