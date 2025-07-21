
import { supabase } from "@/integrations/supabase/client";
import { StatusRecord, Manufacturer, AssetSolution, Plan } from "@/types/asset";

export const referenceDataService = {
  async getStatusRecords(): Promise<StatusRecord[]> {
    const { data, error } = await supabase
      .from('asset_status')
      .select('*')
      .is('deleted_at', null)
      .order('id');
    
    if (error) {
      
      return [];
    }
    
    return data?.map(item => ({
      id: item.id,
      status: item.status,
      association: item.association,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at
    })) || [];
  },

  async getManufacturers(): Promise<Manufacturer[]> {
    const { data, error } = await supabase
      .from('manufacturers')
      .select('*')
      .is('deleted_at', null)
      .order('name');
    
    if (error) {
      
      return [];
    }
    
    return data || [];
  },

  async getAssetSolutions(): Promise<AssetSolution[]> {
    const { data, error } = await supabase
      .from('asset_solutions')
      .select('*')
      .is('deleted_at', null)
      .order('solution');
    
    if (error) {
      
      return [];
    }
    
    return data || [];
  },

  async getPlans(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .is('deleted_at', null)
      .order('nome');
    
    if (error) {
      
      return [];
    }
    
    return data || [];
  }
};
