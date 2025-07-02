
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface AssetLogWithRelationsRaw {
  id: number;
  date: string;
  event: string;
  details: Json; // Usar Json do Supabase em vez de JSON
  status_before_id: number;
  status_after_id: number;
  assoc_id: number;
  fk_asset_logs_status_before: {
    status: string;
  };
  fk_asset_logs_status_after: {
    status: string;
  };
  fk_asset_logs_assoc_id: {
    asset_id: string;
    client_id: string;
    entry_date: string;
    exit_date: string;
    clients: {
      empresa: string;
    };
  };
}

export interface AssetLogWithRelations {
  id: number;
  date: string;
  event: string;
  details: Json; // Mudança aqui também
  status_before_id: number;
  status_after_id: number;
  assoc_id: number;
  status_before: {
    status: string;
  };
  status_after: {
    status: string;
  };
  association: {
    asset_id: string;
    client_id: string;
    entry_date: string;
    exit_date: string;
    clients: {
      empresa: string;
    };
  };
}

export interface AssetHistoryParams {
  assetId?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  eventType?: string;
  page?: number;
  limit?: number;
}

export interface AssetHistoryResponse {
  logs: AssetLogWithRelations[];
  totalCount: number;
  totalPages: number;
}

export const assetHistoryService = {
  async getAssetHistory(params: AssetHistoryParams = {}): Promise<AssetHistoryResponse> {
    const {
      assetId,
      clientId,
      dateFrom,
      dateTo,
      eventType,
      page = 1,
      limit = 50
    } = params;

    let query = supabase
      .from('asset_logs')
      .select(`
        id,
        date,
        event,
        details,
        status_before_id,
        status_after_id,
        assoc_id,
        fk_asset_logs_status_before:asset_status!status_before_id(status),
        fk_asset_logs_status_after:asset_status!status_after_id(status),
        fk_asset_logs_assoc_id:asset_client_assoc!assoc_id(
          asset_id,
          client_id,
          entry_date,
          exit_date,
          clients!client_id(empresa)
        )
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order('date', { ascending: false });

    // Apply filters
    if (assetId) {
      query = query.eq('fk_asset_logs_assoc_id.asset_id', assetId);
    }

    if (clientId) {
      query = query.eq('fk_asset_logs_assoc_id.client_id', clientId);
    }

    if (eventType) {
      query = query.eq('event', eventType);
    }

    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('date', dateTo);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit - 1;
    query = query.range(startIndex, endIndex);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching asset history:', error);
      throw new Error(`Erro ao buscar histórico de ativos: ${error.message}`);
    }

    // Transform data with corrected typing
    const logs: AssetLogWithRelations[] = (data || []).map((log: AssetLogWithRelationsRaw) => ({
      id: log.id,
      date: log.date,
      event: log.event,
      details: log.details, // Agora compatível com Json
      status_before_id: log.status_before_id,
      status_after_id: log.status_after_id,
      assoc_id: log.assoc_id,
      status_before: {
        status: log.fk_asset_logs_status_before?.status || 'Unknown'
      },
      status_after: {
        status: log.fk_asset_logs_status_after?.status || 'Unknown'
      },
      association: {
        asset_id: log.fk_asset_logs_assoc_id?.asset_id || '',
        client_id: log.fk_asset_logs_assoc_id?.client_id || '',
        entry_date: log.fk_asset_logs_assoc_id?.entry_date || '',
        exit_date: log.fk_asset_logs_assoc_id?.exit_date || '',
        clients: {
          empresa: log.fk_asset_logs_assoc_id?.clients?.empresa || 'Unknown'
        }
      }
    }));

    return {
      logs,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  async getAssetEventTypes(): Promise<string[]> {
    const { data, error } = await supabase
      .from('asset_logs')
      .select('event')
      .not('event', 'is', null)
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching event types:', error);
      return [];
    }

    // Get unique event types
    const eventTypes = [...new Set(data.map(item => item.event).filter(Boolean))];
    return eventTypes.sort();
  },

  async getAssetStats(assetId: string) {
    const { data, error } = await supabase
      .from('asset_logs')
      .select('event, created_at')
      .eq('details->>asset_id', assetId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching asset stats:', error);
      return null;
    }

    const totalEvents = data.length;
    const lastActivity = data[0]?.created_at;
    const eventsByType = data.reduce((acc, log) => {
      acc[log.event] = (acc[log.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents,
      lastActivity,
      eventsByType
    };
  }
};
