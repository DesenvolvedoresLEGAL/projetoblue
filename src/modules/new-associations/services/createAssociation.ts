import { supabase } from '@/integrations/supabase/client';

// IDs of equipment solutions that require a chip
const EQUIPMENT_NEEDS_CHIP = [1, 2, 4];
const CHIP_SOLUTION_ID = 11;

export interface AssociationAsset {
  equipment_id?: string;
  chip_id?: string;
  solution_id?: number;
  plan_id?: number | null;
  plan_gb?: number | null;
  equipment_ssid?: string | null;
  equipment_pass?: string | null;
  notes?: string | null;
}

export interface CreateAssociationsParams {
  clientId: string;
  associationTypeId: number;
  entryDate: string; // YYYY-MM-DD
  exitDate?: string | null;
  assets: AssociationAsset[];
}

export interface CreateAssociationsResult {
  success: boolean;
  insertedIds: string[];
}

/**
 * Create association records in the database after validating input.
 */
export const createAssociations = async (
  params: CreateAssociationsParams
): Promise<CreateAssociationsResult> => {
  const errors: string[] = [];

  if (!params.clientId) errors.push('Cliente não selecionado');
  if (!params.associationTypeId) errors.push('Tipo de associação obrigatório');
  if (!params.entryDate) errors.push('Data de entrada obrigatória');
  if (!params.assets || params.assets.length === 0) {
    errors.push('Selecione pelo menos um ativo');
  }

  params.assets.forEach(asset => {
    const isChip = asset.solution_id === CHIP_SOLUTION_ID || !!asset.chip_id && !asset.equipment_id;
    const isEquipment = !!asset.equipment_id;
    if (!isEquipment && !isChip) {
      errors.push('Ativo sem equipamento ou chip informado');
    }
    if (isEquipment && EQUIPMENT_NEEDS_CHIP.includes(asset.solution_id || 0) && !asset.chip_id) {
      errors.push('Equipamento requer CHIP mas nenhum chip foi informado');
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  const insertPayload = params.assets.map(asset => ({
    client_id: params.clientId,
    equipment_id: asset.equipment_id ?? null,
    chip_id: asset.chip_id ?? null,
    entry_date: params.entryDate,
    exit_date: params.exitDate ?? null,
    association_type_id: params.associationTypeId,
    plan_id: asset.plan_id ?? null,
    plan_gb: asset.plan_gb ?? null,
    equipment_ssid: asset.equipment_ssid ?? null,
    equipment_pass: asset.equipment_pass ?? null,
    notes: asset.notes ?? null
  }));

  const { data, error } = await supabase
    .from('associations')
    .insert(insertPayload)
    .select('uuid');

  if (error) {
    throw error;
  }

  const insertedIds = (data || []).map(rec => rec.uuid as string);
  return {
    success: true,
    insertedIds
  };
};
