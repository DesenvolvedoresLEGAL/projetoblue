
import { supabase } from '@/integrations/supabase/client';

export interface AssetInfo {
  id: string;
  solution_id?: number;
}

export interface AddAssetsToAssociationParams {
  client_id: string;
  association_id: number;
  entry_date: string;
  assets: AssetInfo[];
  exit_date?: string | null;
  notes?: string | null;
  ssid?: string | null;
  pass?: string | null;
  gb?: number | null;
}

export interface AddAssetsToAssociationResult {
  success: boolean;
  inserted_count: number;
  failed_count: number;
  inserted_ids: number[];
  failed_assets: Array<{
    asset_id: string;
    error_code: string;
    message: string;
  }>;
  total_processed: number;
  message: string;
  error_code?: string;
  error_detail?: string;
}

export const addAssetsToAssociation = async (
  params: AddAssetsToAssociationParams
): Promise<AddAssetsToAssociationResult> => {
  if (process.env.NODE_ENV === 'development') {
    if (import.meta.env.DEV) console.log('Chamando addAssetsToAssociation com parâmetros:', params);
  }

  const insertPayload = params.assets.map(asset => ({
    client_id: params.client_id,
    association_type_id: params.association_id,
    entry_date: params.entry_date,
    exit_date: params.exit_date ?? null,
    notes: params.notes ?? null,
    equipment_ssid: params.ssid ?? null,
    equipment_pass: params.pass ?? null,
    plan_gb: params.gb ?? null,
    equipment_id: asset.solution_id === 11 ? null : asset.id,
    chip_id: asset.solution_id === 11 ? asset.id : null
  }));

  const { data, error } = await supabase
    .from('associations')
    .insert(insertPayload)
    .select('uuid');

  if (error) {
    if (import.meta.env.DEV) console.error('Erro ao adicionar ativos à associação:', error);
    throw error;
  }

  const insertedIds = data ? data.map(rec => rec.uuid as string) : [];
  return {
    success: true,
    inserted_count: insertedIds.length,
    failed_count: insertPayload.length - insertedIds.length,
    inserted_ids: insertedIds,
    failed_assets: [],
    total_processed: insertPayload.length,
    message: 'ok'
  };
};
