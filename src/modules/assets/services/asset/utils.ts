import { PostgrestError } from "@supabase/supabase-js";
import { AssetLog, StatusRecord, Asset, DatabaseAsset } from "@/types/asset";
import { toast } from "@/utils/toast";
import { mapDatabaseAssetToFrontend } from "@/utils/databaseMappers";
import { showFriendlyError } from '@/utils/errorTranslator';

export const handleAssetError = (
  error: PostgrestError | Error | unknown,
  context: string
) => {
  
  const friendlyMessage = showFriendlyError(error, context.toLowerCase());
  toast.error(friendlyMessage);
};

export const mapDatabaseLogToAssetLog = (
  dbLog: AssetLog
): AssetLog => {
  return {
    id: dbLog.id,
    assoc_id: dbLog.assoc_id,
    date: dbLog.date,
    event: dbLog.event,
    details: dbLog.details,
    status_before_id: dbLog.status_before_id,
    status_after_id: dbLog.status_after_id,
    created_at: dbLog.created_at || new Date().toISOString(),
    updated_at: dbLog.updated_at || new Date().toISOString(),
    deleted_at: dbLog.deleted_at
  };
};

// Database mapper functions for queries
export const mapAssetFromDb = (dbAsset: DatabaseAsset): Asset => {
  return mapDatabaseAssetToFrontend(dbAsset);
};

export const mapAssetLogFromDb = (dbLog: AssetLog): AssetLog => {
  return mapDatabaseLogToAssetLog(dbLog);
};

export const mapStatusFromDb = (dbStatus: StatusRecord): StatusRecord => {
  return {
    id: dbStatus.id,
    status: dbStatus.status,
    association: dbStatus.association,
    created_at: dbStatus.created_at,
    updated_at: dbStatus.updated_at,
    deleted_at: dbStatus.deleted_at
  };
};
