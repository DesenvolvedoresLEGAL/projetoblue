
import { supabase } from "@/integrations/supabase/client";

export interface AssetAssociation {
  id: number;
  client_id: string;
  association_id: number;
  entry_date: string;
  exit_date?: string;
  client_name?: string;
  association_type_name?: string;
}

export const associationQueries = {
  // Check if asset has active associations (rental or subscription)
  async checkActiveAssociations(assetId: string): Promise<AssetAssociation[]> {
    try {
      if (import.meta.env.DEV) console.log(`Checking active associations for asset: ${assetId}`);
      
      const { data, error } = await supabase
        .from('associations')
        .select(`
          uuid,
          client_id,
          association_type_id,
          entry_date,
          exit_date,
          clients!inner(nome),
          association_types!inner(type)
        `)
        .or('equipment_id.eq.' + assetId + ',chip_id.eq.' + assetId)
        .eq('status', true)
        .is('deleted_at', null);

      if (error) {
        if (import.meta.env.DEV) console.error('Error checking asset associations:', error);
        throw error;
      }

      const associations: AssetAssociation[] = (data || []).map(item => ({
        id: parseInt(item.uuid.replace(/-/g, '').substring(0, 10), 16) || 0,
        client_id: item.client_id,
        association_id: item.association_type_id,
        entry_date: item.entry_date,
        exit_date: item.exit_date,
        client_name: (item.clients as { nome?: string } | null)?.nome || 'Cliente não encontrado',
        association_type_name: (item.association_types as { type?: string } | null)?.type || 'Tipo não encontrado'
      }));

      if (import.meta.env.DEV) console.log(`Found ${associations.length} active associations for asset ${assetId}`);
      return associations;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error in checkActiveAssociations:', error);
      throw error;
    }
  }
};
