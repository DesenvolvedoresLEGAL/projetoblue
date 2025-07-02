
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface AssetLogWithRelationsRaw {
  id: number;
  date: string;
  event: string;
  details: Json;
  status_before_id: number;
  status_after_id: number;
  assoc_id: number;
  fk_asset_logs_status_before: { status: string };
  fk_asset_logs_status_after: { status: string };
  fk_asset_logs_assoc_id: {
    id: number;
    entry_date: string;
    exit_date: string | null;
    association_id: number;
    client_id: string;
    asset_id: string;
    clients?: { nome: string };
  };
}

export interface AssetLogWithRelations {
  id: number;
  date: string;
  event: string;
  details: any;
  status_before_id: number;
  status_after_id: number;
  assoc_id: number;
  status_before: { status: string };
  status_after: { status: string };
  association: {
    id: number;
    entry_date: string;
    exit_date: string | null;
    association_id: number;
    client_id: string;
    asset_id: string;
    clients?: { nome: string };
  };
}

export const fetchAssetHistory = async (assetId: string): Promise<AssetLogWithRelations[]> => {
  const { data, error } = await supabase
    .from('asset_logs')
    .select(`
      id,
      date,
      event,
      details,
      status_before_id,
      status_after_id,
      assoc_id,
      fk_asset_logs_status_before:status_before_id (status),
      fk_asset_logs_status_after:status_after_id (status),
      fk_asset_logs_assoc_id:assoc_id (
        id,
        entry_date,
        exit_date,
        association_id,
        client_id,
        asset_id,
        clients:client_id (nome)
      )
    `)
    .eq('details->>asset_id', assetId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching asset history:', error);
    throw error;
  }

  return (data || []).map((log: AssetLogWithRelationsRaw) => ({
    id: log.id,
    date: log.date,
    event: log.event,
    details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
    status_before_id: log.status_before_id,
    status_after_id: log.status_after_id,
    assoc_id: log.assoc_id,
    status_before: log.fk_asset_logs_status_before,
    status_after: log.fk_asset_logs_status_after,
    association: log.fk_asset_logs_assoc_id
  }));
};

export const fetchClientHistory = async (clientId: string): Promise<AssetLogWithRelations[]> => {
  const { data, error } = await supabase
    .from('asset_logs')
    .select(`
      id,
      date,
      event,
      details,
      status_before_id,
      status_after_id,
      assoc_id,
      fk_asset_logs_status_before:status_before_id (status),
      fk_asset_logs_status_after:status_after_id (status),
      fk_asset_logs_assoc_id:assoc_id (
        id,
        entry_date,
        exit_date,
        association_id,
        client_id,
        asset_id,
        clients:client_id (nome)
      )
    `)
    .eq('details->>client_id', clientId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching client history:', error);
    throw error;
  }

  return (data || []).map((log: AssetLogWithRelationsRaw) => ({
    id: log.id,
    date: log.date,
    event: log.event,
    details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
    status_before_id: log.status_before_id,
    status_after_id: log.status_after_id,
    assoc_id: log.assoc_id,
    status_before: log.fk_asset_logs_status_before,
    status_after: log.fk_asset_logs_status_after,
    association: log.fk_asset_logs_assoc_id
  }));
};

export const fetchAllHistory = async (): Promise<AssetLogWithRelations[]> => {
  const { data, error } = await supabase
    .from('asset_logs')
    .select(`
      id,
      date,
      event,
      details,
      status_before_id,
      status_after_id,
      assoc_id,
      fk_asset_logs_status_before:status_before_id (status),
      fk_asset_logs_status_after:status_after_id (status),
      fk_asset_logs_assoc_id:assoc_id (
        id,
        entry_date,
        exit_date,
        association_id,
        client_id,
        asset_id,
        clients:client_id (nome)
      )
    `)
    .order('date', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching all history:', error);
    throw error;
  }

  return (data || []).map((log: AssetLogWithRelationsRaw) => ({
    id: log.id,
    date: log.date,
    event: log.event,
    details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
    status_before_id: log.status_before_id,
    status_after_id: log.status_after_id,
    assoc_id: log.assoc_id,
    status_before: log.fk_asset_logs_status_before,
    status_after: log.fk_asset_logs_status_after,
    association: log.fk_asset_logs_assoc_id
  }));
};
