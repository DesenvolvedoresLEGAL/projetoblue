
import { PostgrestError } from "@supabase/supabase-js";
import { AssetLog, Status } from "@/types/asset";
import { toast } from "@/utils/toast";

export const handleAssetError = (error: PostgrestError | Error | any, context: string) => {
  console.error(`${context}:`, error);
  const message = error?.message || "Erro desconhecido";
  toast.error(`${context}: ${message}`);
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
