
import { translateError } from "@/utils/errorTranslator";
import { toast } from "@/utils/toast";
import { Asset, AssetLog, StatusRecord } from "@/types/asset";

// Handle and translate asset-related errors
export const handleAssetError = (error: any, context: string) => {
  console.error(`[Asset Error - ${context}]:`, error);
  
  // Use the error translator for user-friendly messages
  const userMessage = translateError(error, { 
    action: context.includes('create') ? 'create' : 
           context.includes('update') ? 'update' : 
           context.includes('delete') ? 'delete' : 'fetch',
    entity: 'o ativo'
  });
  
  // Don't show toast here since it's handled by the calling function
  // This function is mainly for logging and context
  return userMessage;
};

// Validate asset data before operations
export const validateAssetData = (assetData: any): string | null => {
  if (!assetData) {
    return "Dados do ativo são obrigatórios";
  }
  
  // Add more specific validations as needed
  if (assetData.type === 'CHIP' && !assetData.iccid) {
    return "ICCID é obrigatório para chips";
  }
  
  if (assetData.type === 'ROTEADOR' && !assetData.radio) {
    return "Número do rádio é obrigatório para equipamentos";
  }
  
  return null;
};

// Map database asset to frontend asset
export const mapAssetFromDb = (dbAsset: any): Asset => {
  return {
    id: dbAsset.uuid,
    uuid: dbAsset.uuid,
    type: dbAsset.asset_solutions?.solution === 'CHIP' ? 'CHIP' : 'ROTEADOR',
    serialNumber: dbAsset.serial_number || '',
    model: dbAsset.model || '',
    iccid: dbAsset.iccid || '',
    status: dbAsset.asset_status?.status || 'DISPONÍVEL',
    statusId: dbAsset.status_id,
    manufacturer: dbAsset.manufacturers?.name || '',
    manufacturerId: dbAsset.manufacturer_id,
    registrationDate: dbAsset.created_at,
    lastUpdate: dbAsset.updated_at,
    clientId: dbAsset.client_id,
    radio: dbAsset.radio,
    lineNumber: dbAsset.line_number || 0,
    rentedDays: dbAsset.rented_days || 0,
    solution_id: dbAsset.solution_id
  };
};

// Map database asset log to frontend asset log
export const mapAssetLogFromDb = (dbLog: any): AssetLog => {
  return {
    id: dbLog.id,
    assetId: dbLog.asset_id,
    action: dbLog.action,
    description: dbLog.description || '',
    timestamp: dbLog.created_at,
    userId: dbLog.user_id,
    details: dbLog.details
  };
};

// Map database status to frontend status
export const mapStatusFromDb = (dbStatus: any): StatusRecord => {
  return {
    id: dbStatus.id,
    status: dbStatus.status
  };
};
