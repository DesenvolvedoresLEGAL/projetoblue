/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from "@/integrations/supabase/client";
import { Asset, AssetLog, StatusRecord } from "@/types/asset";
import {
  AssetListParams,
  AssetStatusByType,
  ProblemAsset,
} from "./types";
import type { Database } from "@/integrations/supabase/types";

type ProblemAssetFromDb =
  Database["public"]["Views"]["v_problem_assets"]["Row"];
import { mapAssetFromDb, mapAssetLogFromDb, mapStatusFromDb } from "./utils";

interface Manufacturer {
    country: string;
    created_at: string;
    deleted_at: string;
    description: string;
    id: number;
    name: string;
    updated_at: string;
    website: string;
}

/**
 * Get a list of assets with optional filters and pagination.
 */
export const getAssets = async (
  params?: AssetListParams
): Promise<{ data: Asset[]; count: number }> => {
  try {
    let query = supabase
      .from("assets")
      .select(
        `
        uuid, serial_number, model, iccid, solution_id, status_id, line_number, radio,
        manufacturer_id, created_at, updated_at, rented_days, deleted_at,
        manufacturers(id, name),
        asset_status(id, status),
        asset_solutions(id, solution)
      `,
        { count: "exact" }
      )
      .is("deleted_at", null);

    // Apply filters based on params
    if (params?.typeId) {
      query = query.eq("solution_id", params.typeId);
    }
    if (params?.statusId) {
      query = query.eq("status_id", params.statusId);
    }

    // Implement search functionality
    if (params?.search) {
      const searchTerm = `%${params.search}%`;
      query = query.or(
        `iccid.ilike.${searchTerm},serial_number.ilike.${searchTerm},model.ilike.${searchTerm},radio.ilike.${searchTerm}`
      );
    }

    // Sorting - simplified to prevent type instantiation issues
    if (params?.sortOrder === "desc") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: true });
    }

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit - 1;

    query = query.range(startIndex, endIndex);

    const { data, error, count } = await query;

    if (error) {
      
      throw error;
    }

    const assets: Asset[] = (data || []).map((item: any) => mapAssetFromDb(item));

    return { data: assets, count: count || 0 };
  } catch (error) {
    
    return { data: [], count: 0 };
  }
};

/**
 * Get a single asset by its ID.
 */
export const getAssetById = async (id: string): Promise<Asset | null> => {
  try {
    const { data, error } = await supabase
      .from("assets")
      .select(
        `
        uuid, serial_number, model, iccid, solution_id, status_id, line_number, radio,
        manufacturer_id, created_at, updated_at, rented_days, client_id, deleted_at,
        manufacturers(id, name),
        asset_status(id, status),
        asset_solutions(id, solution)
      `
      )
      .eq("uuid", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      
      throw error;
    }

    if (!data) {
      
      return null;
    }

    const asset = mapAssetFromDb(data as any);
    return asset;
  } catch (error) {
    
    return null;
  }
};

/**
 * Get assets by status ID.
 */
export const getAssetsByStatus = async (statusId: number): Promise<Asset[]> => {
  try {
    

    const { data, error } = await supabase
      .from("assets")
      .select(
        `
        uuid, serial_number, model, iccid, solution_id, status_id, line_number, radio,
        manufacturer_id, created_at, updated_at, rented_days, deleted_at,
        manufacturers(id, name),
        asset_status(id, status),
        asset_solutions(id, solution)
      `
      )
      .eq("status_id", statusId)
      .is("deleted_at", null);

    if (error) {
      
      throw error;
    }

    const assets: Asset[] = (data || []).map((item: any) => mapAssetFromDb(item));
    
    return assets;
  } catch (error) {
    if (import.meta.env.DEV) console.error(
      `Error in getAssetsByStatus for status ID ${statusId}:`,
      error
    );
    return [];
  }
};

/**
 * Get assets by type (solution ID).
 */
export const getAssetsByType = async (typeId: number): Promise<Asset[]> => {
  try {
    

    const { data, error } = await supabase
      .from("assets")
      .select(
        `
        uuid, serial_number, model, iccid, solution_id, status_id, line_number, radio,
        manufacturer_id, created_at, updated_at, rented_days, client_id, deleted_at,
        manufacturers(id, name),
        asset_status(id, status),
        asset_solutions(id, solution)
      `
      )
      .eq("solution_id", typeId)
      .is("deleted_at", null);

    if (error) {
      
      throw error;
    }

    const assets: Asset[] = (data || []).map((item: any) => mapAssetFromDb(item));
    
    return assets;
  } catch (error) {
    
    return [];
  }
};

/**
 * List assets that are considered "problem" assets.
 */
export const listProblemAssets = async (): Promise<ProblemAsset[]> => {
  try {
    const { data, error } = await supabase.from("v_problem_assets").select("*");

    if (error) {
      
      throw error;
    }

    // Map the data to ensure it matches ProblemAsset interface
    return (data || []).map((asset: ProblemAssetFromDb) => ({
      uuid: asset.uuid,
      id: null,
      radio: asset.radio || null,
      line_number: asset.line_number || 0,
      solution_id: asset.solution_id,
      type: "UNKNOWN",
      status: asset.status_name,
      statusId: asset.status_id,
      identifier: "",
    }));
  } catch (error) {
    
    return [];
  }
};

/**
 * Get the count of assets by status and type.
 */
export const statusByType = async (): Promise<AssetStatusByType[]> => {
  try {
    const { data, error } = await supabase.rpc("status_by_asset_type");

    if (error) {
      
      throw error;
    }

    return data || [];
  } catch (error) {
    
    return [];
  }
};

/**
 * Get assets by multiple status IDs
 */
export const getAssetsByMultipleStatus = async (
  statusIds: number[]
): Promise<Asset[]> => {
  try {
    

    const { data, error } = await supabase
      .from("assets")
      .select(
        `
        uuid, serial_number, model, iccid, solution_id, status_id, line_number, radio,
        manufacturer_id, created_at, updated_at, rented_days, deleted_at,
        manufacturers(id, name),
        asset_status(id, status),
        asset_solutions(id, solution)
      `
      )
      .in("status_id", statusIds)
      .is("deleted_at", null);

    if (error) {
      
      throw error;
    }

    const assets: Asset[] = (data || []).map((item: any) => mapAssetFromDb(item));
    if (import.meta.env.DEV) console.log(
      `Retrieved ${assets.length} assets with status IDs ${statusIds.join(
        ", "
      )}`
    );
    return assets;
  } catch (error) {
    
    return [];
  }
};


/**
 * Retrieve manufacturer information by id.
 */
export const getManufacturerById = async (
  id: number
): Promise<Manufacturer | null> => {
  try {
    const { data, error } = await supabase
      .from("manufacturers")
      .select("*")
      .eq("id", id)
      .single<Manufacturer>();

    if (error) {
      
      throw error;
    }

    if (!data) {
      
      return null;
    }

    return data;
  } catch (error) {
    
    return null;
  }
};

/**
 * Retrieve available asset status records.
 */
export const getStatus = async (): Promise<StatusRecord[]> => {
  try {
    const { data, error } = await supabase.from("asset_status").select("*");

    if (error) {
      
      return [];
    }

    

    const statusArray: StatusRecord[] = (data || []).map(mapStatusFromDb);

    return statusArray;
  } catch (error) {
    
    return [];
  }
};

/**
 * Fetch asset log entries with optional pagination.
 */
export const getAssetLogs = async (
  params?: AssetListParams
): Promise<AssetLog[]> => {
  try {
    let query = supabase
      .from("asset_logs")
      .select("*")
      .order("created_at", { ascending: false });

    // Paginação
    if (params?.limit) {
      query = query.range(0, params.limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      
      return [];
    }

    if (!data) {
      
      return [];
    }

    const assetLogs: AssetLog[] = data.map((item: any) => mapAssetLogFromDb(item));

    return assetLogs;
  } catch (error) {
    
    return [];
  }
};

