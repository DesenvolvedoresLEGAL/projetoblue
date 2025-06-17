
import { PostgrestError } from "@supabase/supabase-js";
import { AssetLog, StatusRecord, Asset } from "@/types/asset";
import { toast } from "@/utils/toast";
import { mapDatabaseAssetToFrontend } from "@/utils/databaseMappers";
import { showFriendlyError } from "@/utils/errorTranslator";

export const handleAssetError = (error: PostgrestError | Error | any, context: string) => {
  console.error(`${context}:`, error);
  showFriendlyError(error, `Erro ao ${context.toLowerCase()}: Tente novamente ou entre em contato com o suporte.`);
};

export const mapDatabaseLogToAssetLog = (dbLog: any): AssetLog => {
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
export const mapAssetFromDb = (dbAsset: any): Asset => {
  return mapDatabaseAssetToFrontend(dbAsset);
};

export const mapAssetLogFromDb = (dbLog: any): AssetLog => {
  return mapDatabaseLogToAssetLog(dbLog);
};

export const mapStatusFromDb = (dbStatus: any): StatusRecord => {
  return {
    id: dbStatus.id,
    status: dbStatus.status,
    association: dbStatus.association,
    created_at: dbStatus.created_at,
    updated_at: dbStatus.updated_at,
    deleted_at: dbStatus.deleted_at
  };
};
