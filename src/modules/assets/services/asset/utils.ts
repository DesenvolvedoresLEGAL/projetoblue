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
    registrationDate: dbAsset.created_at,
    status: dbAsset.asset_status?.status || 'DISPONÍVEL',
    statusId: dbAsset.status_id,
    serial_number: dbAsset.serial_number || '',
    model: dbAsset.model || '',
    radio: dbAsset.radio,
    solution_id: dbAsset.solution_id,
    manufacturer_id: dbAsset.manufacturer_id,
    plan_id: dbAsset.plan_id,
    rented_days: dbAsset.rented_days || 0,
    admin_user: dbAsset.admin_user,
    admin_pass: dbAsset.admin_pass,
    ssid_fabrica: dbAsset.ssid_fabrica,
    pass_fabrica: dbAsset.pass_fabrica,
    admin_user_fabrica: dbAsset.admin_user_fabrica,
    admin_pass_fabrica: dbAsset.admin_user_fabrica,
    ssid_atual: dbAsset.ssid_atual,
    pass_atual: dbAsset.pass_atual,
    created_at: dbAsset.created_at,
    updated_at: dbAsset.updated_at,
    deleted_at: dbAsset.deleted_at,
    // Type-specific properties
    ...(dbAsset.asset_solutions?.solution === 'CHIP' ? {
      iccid: dbAsset.iccid || '',
      phoneNumber: dbAsset.line_number?.toString() || '',
      carrier: dbAsset.manufacturers?.name || 'Unknown',
      line_number: dbAsset.line_number
    } : {
      uniqueId: dbAsset.uuid,
      brand: dbAsset.manufacturers?.name || '',
      ssid: dbAsset.ssid_atual || '',
      password: dbAsset.pass_atual || '',
      serialNumber: dbAsset.serial_number || '',
      ipAddress: dbAsset.ip_address,
      adminUser: dbAsset.admin_user,
      adminPassword: dbAsset.admin_pass,
      imei: dbAsset.imei
    })
  };
};

// Map database asset log to frontend asset log
export const mapAssetLogFromDb = (dbLog: any): AssetLog => {
  return {
    id: dbLog.id,
    assoc_id: dbLog.assoc_id,
    date: dbLog.date,
    event: dbLog.event || '',
    details: dbLog.details,
    status_before_id: dbLog.status_before_id,
    status_after_id: dbLog.status_after_id,
    deleted_at: dbLog.deleted_at,
    updated_at: dbLog.updated_at,
    created_at: dbLog.created_at
  };
};

// Map database status to frontend status
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
