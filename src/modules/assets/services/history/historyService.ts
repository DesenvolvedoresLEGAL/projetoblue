
import { supabase } from "@/integrations/supabase/client";

export interface AssetLogWithRelationsRaw {
  id: number;
  date: string;
  event: string;
  details: JSON;
  status_before_id: number;
  status_after_id: number;
  assoc_id: number;
  status_before: { status: string } | null;
  status_after: { status: string } | null;
  association: {
    id: number;
    client: {
      nome: string;
      empresa: string;
    } | null;
  } | null;
}

export const historyService = {
  async getAssetHistory(assetId: string) {
    // Query the asset_logs table with joins to related tables
    const { data: assetLogs, error: assetLogsError } = await supabase
      .from('asset_logs')
      .select(`
        uuid,
        event,
        details,
        created_at,
        status_before_id,
        status_after_id
      `)
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false });

    if (assetLogsError) {
      console.error('Error fetching asset logs:', assetLogsError);
      throw assetLogsError;
    }

    // Query the legacy asset_logs_legacy table
    const { data: legacyLogs, error: legacyLogsError } = await supabase
      .from('asset_logs_legacy')
      .select(`
        id,
        date,
        event,
        details,
        status_before_id,
        status_after_id,
        assoc_id,
        asset_status!fk_asset_logs_status_before (status),
        asset_status!fk_asset_logs_status_after (status),
        asset_client_assoc!fk_asset_logs_assoc_id (
          id,
          clients!asset_client_assoc_client_id_fkey (nome, empresa)
        )
      `)
      .order('date', { ascending: false });

    if (legacyLogsError) {
      console.error('Error fetching legacy asset logs:', legacyLogsError);
      throw legacyLogsError;
    }

    // Process asset logs
    const processedAssetLogs = (assetLogs || []).map(log => ({
      uuid: log.uuid,
      event: log.event,
      details: log.details,
      created_at: log.created_at,
      status_before_id: log.status_before_id,
      status_after_id: log.status_after_id,
      type: 'new' as const
    }));

    // Process legacy logs
    const processedLegacyLogs = (legacyLogs || [])
      .filter((log): log is AssetLogWithRelationsRaw => {
        return log && typeof log === 'object' && 'id' in log;
      })
      .map(log => ({
        id: log.id,
        date: log.date,
        event: log.event,
        details: log.details,
        status_before_id: log.status_before_id,
        status_after_id: log.status_after_id,
        assoc_id: log.assoc_id,
        status_before: log.status_before,
        status_after: log.status_after,
        association: log.association,
        type: 'legacy' as const
      }));

    return {
      assetLogs: processedAssetLogs,
      legacyLogs: processedLegacyLogs
    };
  },

  async getAssociationHistory(assetId: string) {
    // Query associations where this asset was used (either as equipment or chip)
    const { data: associations, error } = await supabase
      .from('associations')
      .select(`
        uuid,
        entry_date,
        exit_date,
        status,
        equipment_id,
        chip_id,
        clients!client_id_fkey (
          nome,
          empresa
        ),
        association_types!association_type_id_fkey (
          type
        )
      `)
      .or(`equipment_id.eq.${assetId},chip_id.eq.${assetId}`)
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Error fetching association history:', error);
      throw error;
    }

    return associations || [];
  }
};
