import { supabase } from '@/integrations/supabase/client';
import {
  Asset,
  AssetListParams,
  AssetStatusByType,
  ProblemAsset
} from './types';
import { mapAssetFromDb } from './utils';

/**
 * Get a list of assets with optional filters and pagination.
 */
export const getAssets = async (params?: AssetListParams): Promise<{ data: Asset[]; count: number }> => {
  try {
    let query = supabase
      .from('assets')
      .select(`
        uuid, serial_number, model, iccid, solution_id, status_id, line_number, radio,
        manufacturer_id, created_at, updated_at, dias_alugada, client_id, deleted_at,
        manufacturers(id, name),
        asset_status(id, status),
        asset_solutions(id, solution)
      `, { count: 'exact' })
      .is('deleted_at', null);

    // Apply filters based on params
    if (params?.type) {
      query = query.eq('solution_id', params.type);
    }
    if (params?.status) {
      query = query.eq('status_id', params.status);
    }
    if (params?.clientId) {
      query = query.eq('client_id', params.clientId);
    }

    // Implement search functionality
    if (params?.searchTerm) {
      const searchTerm = `%${params.searchTerm}%`;
      query = query.or(
        `iccid.ilike.${searchTerm},serial_number.ilike.${searchTerm},model.ilike.${searchTerm},radio.ilike.${searchTerm}`
      );
    }

    // Handle unassigned assets filter
    if (params?.unassigned === 'true') {
      query = query.is('client_id', null);
    }

    // Sorting
    if (params?.sortBy) {
      const isAscending = params.sortOrder === 'asc';
      query = query.order(params.sortBy, { ascending: isAscending });
    } else {
      // Default sorting by created_at in descending order
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit - 1;

    query = query.range(startIndex, endIndex);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }

    const assets = data.map(mapAssetFromDb);

    return { data: assets, count: count || 0 };
  } catch (error) {
    console.error('Error in getAssets:', error);
    return { data: [], count: 0 };
  }
};

/**
 * Get a single asset by its ID.
 */
export const getAssetById = async (id: string): Promise<Asset | null> => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select(`
        uuid, serial_number, model, iccid, solution_id, status_id, line_number, radio,
        manufacturer_id, created_at, updated_at, dias_alugada, client_id, deleted_at,
        manufacturers(id, name),
        asset_status(id, status),
        asset_solutions(id, solution)
      `)
      .eq('uuid', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error(`Error fetching asset with ID ${id}:`, error);
      throw error;
    }

    if (!data) {
      console.log(`Asset with ID ${id} not found.`);
      return null;
    }

    const asset = mapAssetFromDb(data);
    return asset;
  } catch (error) {
    console.error(`Error in getAssetById for ID ${id}:`, error);
    return null;
  }
};

/**
 * Get assets by status ID.
 */
export const getAssetsByStatus = async (statusId: number): Promise<Asset[]> => {
  try {
    console.log(`Fetching assets with status ID: ${statusId}`);

    const { data, error } = await supabase
      .from('assets')
      .select(`
        uuid, serial_number, model, iccid, solution_id, status_id, line_number, radio,
        manufacturer_id, created_at, updated_at, dias_alugada, client_id, deleted_at,
        manufacturers(id, name),
        asset_status(id, status),
        asset_solutions(id, solution)
      `)
      .eq('status_id', statusId)
      .is('deleted_at', null);

    if (error) {
      console.error(`Error fetching assets with status ID ${statusId}:`, error);
      throw error;
    }

    const assets = data.map(mapAssetFromDb);
    console.log(`Retrieved ${assets.length} assets with status ID ${statusId}`);
    return assets;
  } catch (error) {
    console.error(`Error in getAssetsByStatus for status ID ${statusId}:`, error);
    return [];
  }
};

/**
 * Get assets by type (solution ID).
 */
export const getAssetsByType = async (typeId: number): Promise<Asset[]> => {
  try {
    console.log(`Fetching assets with type ID: ${typeId}`);

    const { data, error } = await supabase
      .from('assets')
      .select(`
        uuid, serial_number, model, iccid, solution_id, status_id, line_number, radio,
        manufacturer_id, created_at, updated_at, dias_alugada, client_id, deleted_at,
        manufacturers(id, name),
        asset_status(id, status),
        asset_solutions(id, solution)
      `)
      .eq('solution_id', typeId)
      .is('deleted_at', null);

    if (error) {
      console.error(`Error fetching assets with type ID ${typeId}:`, error);
      throw error;
    }

    const assets = data.map(mapAssetFromDb);
    console.log(`Retrieved ${assets.length} assets with type ID ${typeId}`);
    return assets;
  } catch (error) {
    console.error(`Error in getAssetsByType for type ID ${typeId}:`, error);
    return [];
  }
};

/**
 * List assets that are considered "problem" assets.
 */
export const listProblemAssets = async (): Promise<ProblemAsset[]> => {
  try {
    const { data, error } = await supabase
      .from('v_problem_assets')
      .select('*');

    if (error) {
      console.error('Error listing problem assets:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in listProblemAssets:', error);
    return [];
  }
};

/**
 * Get the count of assets by status and type.
 */
export const statusByType = async (): Promise<AssetStatusByType[]> => {
  try {
    const { data, error } = await supabase
      .rpc('status_by_asset_type');

    if (error) {
      console.error('Error fetching status by type:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in statusByType:', error);
    return [];
  }
};

/**
 * Get assets by multiple status IDs
 * Problem: Consultas Redundantes
 * Solução: Consolidar consultas para múltiplos status
 */
export const getAssetsByMultipleStatus = async (statusIds: number[]): Promise<Asset[]> => {
  try {
    console.log(`Fetching assets with status IDs: ${statusIds.join(', ')}`);
    
    const { data, error } = await supabase
      .from('assets')
      .select(`
        uuid, serial_number, model, iccid, solution_id, status_id, line_number, radio,
        manufacturer_id, created_at, updated_at, dias_alugada, client_id, deleted_at,
        manufacturers(id, name),
        asset_status(id, status),
        asset_solutions(id, solution)
      `)
      .in('status_id', statusIds)
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching assets by multiple status:', error);
      throw error;
    }

    const assets = data.map(mapAssetFromDb);
    console.log(`Retrieved ${assets.length} assets with status IDs ${statusIds.join(', ')}`);
    return assets;
  } catch (error) {
    console.error('Error in getAssetsByMultipleStatus:', error);
    return [];
  }
};

export const assetQueries = {
  getAssets,
  getAssetById,
  getAssetsByStatus,
  getAssetsByType,
  getAssetsByMultipleStatus,
  listProblemAssets,
  statusByType,
};
