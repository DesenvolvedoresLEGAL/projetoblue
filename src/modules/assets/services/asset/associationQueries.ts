
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
      console.log(`Checking active associations for asset: ${assetId}`);
      
      const { data, error } = await supabase
        .from('asset_client_assoc')
        .select(`
          id,
          client_id,
          association_id,
          entry_date,
          exit_date,
          clients!inner(nome),
          association_types!inner(type)
        `)
        .eq('asset_id', assetId)
        .is('exit_date', null)
        .is('deleted_at', null);

      if (error) {
        console.error('Error checking asset associations:', error);
        throw error;
      }

      const associations: AssetAssociation[] = (data || []).map(item => ({
        id: item.id,
        client_id: item.client_id,
        association_id: item.association_id,
        entry_date: item.entry_date,
        exit_date: item.exit_date,
        client_name: (item.clients as { nome?: string } | null)?.nome || 'Cliente não encontrado',
        association_type_name: (item.association_types as { type?: string } | null)?.type || 'Tipo não encontrado'
      }));

      console.log(`Found ${associations.length} active associations for asset ${assetId}`);
      return associations;
    } catch (error) {
      console.error('Error in checkActiveAssociations:', error);
      throw error;
    }
  }
};
