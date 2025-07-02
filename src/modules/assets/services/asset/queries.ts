
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types/asset';
import { Manufacturer as AssetManufacturer } from "@/types/asset";
import { mapDatabaseAssetToFrontend } from '@/utils/databaseMappers';

// Interface for the data coming from Supabase
interface QueryResult {
  uuid: string;
  serial_number?: string;
  model?: string;
  iccid?: string;
  solution_id?: number;
  status_id?: number;
  line_number?: number;
  radio?: string;
  manufacturer_id?: number;
  created_at?: string;
  updated_at?: string;
  admin_user?: string;
  admin_pass?: string;
  rented_days?: number;
  asset_solutions?: { solution: string };
  manufacturers?: { name: string };
  asset_status?: { status: string };
}

export const fetchAssetsWithManufacturer = async (): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from('assets')
    .select(`
      uuid,
      serial_number,
      model,
      iccid,
      solution_id,
      status_id,
      line_number,
      radio,
      manufacturer_id,
      created_at,
      updated_at,
      admin_user,
      admin_pass,
      rented_days,
      asset_solutions:solution_id (solution),
      manufacturers:manufacturer_id (name),
      asset_status:status_id (status)
    `)
    .is('deleted_at', null);

  if (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }

  // Transform each query result to match DatabaseAsset interface
  return (data || []).map((item: QueryResult) => {
    const dbAsset = {
      uuid: item.uuid || '',
      model: item.model,
      rented_days: item.rented_days || 0,
      serial_number: item.serial_number,
      line_number: item.line_number,
      iccid: item.iccid,
      radio: item.radio,
      created_at: item.created_at,
      updated_at: item.updated_at || new Date().toISOString(),
      admin_user: item.admin_user || 'admin',
      admin_pass: item.admin_pass || '',
      solution_id: item.solution_id,
      status_id: item.status_id,
      manufacturer_id: item.manufacturer_id,
      plan_id: null,
      deleted_at: null,
      ssid_fabrica: null,
      pass_fabrica: null,
      admin_user_fabrica: null,
      admin_pass_fabrica: null,
      ssid_atual: null,
      pass_atual: null,
      asset_solutions: item.asset_solutions,
      manufacturers: item.manufacturers,
      asset_status: item.asset_status
    };
    
    return mapDatabaseAssetToFrontend(dbAsset);
  });
};

export const fetchAssetsWithFullDetails = async (): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from('assets')
    .select(`
      uuid,
      serial_number,
      model,
      iccid,
      solution_id,
      status_id,
      line_number,
      radio,
      manufacturer_id,
      created_at,
      updated_at,
      admin_user,
      admin_pass,
      rented_days,
      asset_solutions:solution_id (solution),
      manufacturers:manufacturer_id (name),
      asset_status:status_id (status)
    `)
    .is('deleted_at', null);

  if (error) {
    console.error('Error fetching assets with full details:', error);
    if (error.message.includes("column 'client_id' does not exist")) {
      console.warn('Fallback: client_id column not found, continuing without it');
      // Continue processing without the problematic field
      return [];
    }
    throw error;
  }

  return (data || []).map((item: QueryResult) => {
    const dbAsset = {
      uuid: item.uuid || '',
      model: item.model,
      rented_days: item.rented_days || 0,
      serial_number: item.serial_number,
      line_number: item.line_number,
      iccid: item.iccid,
      radio: item.radio,
      created_at: item.created_at,
      updated_at: item.updated_at || new Date().toISOString(),
      admin_user: item.admin_user || 'admin',
      admin_pass: item.admin_pass || '',
      solution_id: item.solution_id,
      status_id: item.status_id,
      manufacturer_id: item.manufacturer_id,
      plan_id: null,
      deleted_at: null,
      ssid_fabrica: null,
      pass_fabrica: null,
      admin_user_fabrica: null,
      admin_pass_fabrica: null,
      ssid_atual: null,
      pass_atual: null,
      asset_solutions: item.asset_solutions,
      manufacturers: item.manufacturers,
      asset_status: item.asset_status
    };
    
    return mapDatabaseAssetToFrontend(dbAsset);
  });
};

export const fetchProblemAssetsByType = async () => {
  const { data, error } = await supabase
    .from('v_problem_assets')
    .select('*');

  if (error) {
    console.error('Error fetching problem assets:', error);
    if (error.message.includes("column 'client_id' does not exist")) {
      console.warn('Fallback: client_id column not found in problem assets view');
      return [];
    }
    throw error;
  }

  return data || [];
};

export const fetchAvailableAssets = async (): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from('assets')
    .select(`
      uuid,
      serial_number,
      model,
      iccid,
      solution_id,
      status_id,
      line_number,
      radio,
      manufacturer_id,
      created_at,
      updated_at,
      admin_user,
      admin_pass,
      rented_days,
      asset_solutions:solution_id (solution),
      manufacturers:manufacturer_id (name),
      asset_status:status_id (status)
    `)
    .eq('status_id', 1) // Available status
    .is('deleted_at', null);

  if (error) {
    console.error('Error fetching available assets:', error);
    throw error;
  }

  return (data || []).map((item: QueryResult) => {
    const dbAsset = {
      uuid: item.uuid || '',
      model: item.model,
      rented_days: item.rented_days || 0,
      serial_number: item.serial_number,
      line_number: item.line_number,
      iccid: item.iccid,
      radio: item.radio,
      created_at: item.created_at,
      updated_at: item.updated_at || new Date().toISOString(),
      admin_user: item.admin_user || 'admin',
      admin_pass: item.admin_pass || '',
      solution_id: item.solution_id,
      status_id: item.status_id,
      manufacturer_id: item.manufacturer_id,
      plan_id: null,
      deleted_at: null,
      ssid_fabrica: null,
      pass_fabrica: null,
      admin_user_fabrica: null,
      admin_pass_fabrica: null,
      ssid_atual: null,
      pass_atual: null,
      asset_solutions: item.asset_solutions,
      manufacturers: item.manufacturers,
      asset_status: item.asset_status
    };
    
    return mapDatabaseAssetToFrontend(dbAsset);
  });
};

export const fetchAssetManufacturers = async (): Promise<AssetManufacturer[]> => {
  const { data, error } = await supabase
    .from('manufacturers')
    .select('id, name, country, description, website')
    .is('deleted_at', null)
    .order('name');

  if (error) {
    console.error('Error fetching manufacturers:', error);
    throw error;
  }

  return data || [];
};
