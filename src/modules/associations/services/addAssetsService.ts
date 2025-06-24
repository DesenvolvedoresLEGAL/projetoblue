
import { supabase } from '@/integrations/supabase/client';

export interface AddAssetsToAssociationParams {
  client_id: string;
  association_id: number;
  entry_date: string;
  asset_ids: string[];
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
  console.log('Chamando add_assets_to_association com parâmetros:', params);

  const { data, error } = await supabase.rpc('add_assets_to_association', {
    p_client_id: params.client_id,
    p_association_id: params.association_id,
    p_entry_date: params.entry_date,
    p_asset_ids: params.asset_ids,
    p_exit_date: params.exit_date,
    p_notes: params.notes,
    p_ssid: params.ssid,
    p_pass: params.pass,
    p_gb: params.gb
  });

  if (error) {
    console.error('Erro ao adicionar ativos à associação:', error);
    throw error;
  }

  console.log('Resultado da adição de ativos:', data);
  return data as unknown as AddAssetsToAssociationResult;
};
