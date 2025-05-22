
import { AssetStatus, Asset } from "@/types/asset";

// Constants for asset type identification
export const SOLUTION_IDS = {
  CHIP: 11,
  SPEEDY_5G: 1
};

/**
 * Gets a human-readable identifier for an asset, with consistent fallback pattern
 */
export const getAssetIdentifier = (asset: any): string => {
  if (!asset) return 'N/A';
  
  // For chips
  if (asset.solution_id === SOLUTION_IDS.CHIP || 
      asset.type === 'CHIP' || 
      asset.solucao === 'CHIP') {
    return asset.line_number || asset.iccid || 'N/A';
  }
  
  // For routers/equipment
  return asset.radio || asset.serial_number || 'N/A';
};

/**
 * Gets the standardized asset type based on solution_id or other properties
 */
export const getAssetType = (asset: any): string => {
  if (!asset) return 'Desconhecido';
  
  if (asset.solution_id === SOLUTION_IDS.CHIP) return 'CHIP';
  if (asset.solution_id === SOLUTION_IDS.SPEEDY_5G) return 'SPEEDY 5G';
  
  // Fallback options
  return asset.type || 
         (asset.solucao?.solution || asset.solution || 'Equipamento');
};

/**
 * Normalize an asset object to have consistent property names
 */
export const normalizeAsset = (asset: any) => {
  if (!asset) return null;
  
  return {
    id: asset.uuid || asset.id,
    uuid: asset.uuid || asset.id,
    type: getAssetType(asset),
    identifier: getAssetIdentifier(asset),
    status: asset.status?.status || asset.status || 'Desconhecido',
    statusId: asset.status_id || asset.statusId,
    solution_id: asset.solution_id,
    line_number: asset.line_number,
    iccid: asset.iccid,
    radio: asset.radio,
    serial_number: asset.serial_number || asset.serialNumber,
    model: asset.model,
    manufacturer: asset.manufacturer?.name || asset.manufacturer,
    solution: asset.solucao?.solution || asset.solution,
    createdAt: asset.created_at || asset.createdAt
  };
};

/**
 * Checks if two status values refer to the same status
 */
export const isSameStatus = (status1: string | undefined, status2: string | undefined): boolean => {
  if (!status1 || !status2) return false;
  return status1.toUpperCase() === status2.toUpperCase();
};

/**
 * Type guard to check if a value is a valid AssetStatus
 */
export const isValidAssetStatus = (status: string): status is AssetStatus => {
  const validStatuses: AssetStatus[] = [
    "DISPONÍVEL", "ALUGADO", "ASSINATURA", "SEM DADOS", "BLOQUEADO", "MANUTENÇÃO", "extraviado"
  ];
  return validStatuses.includes(status as AssetStatus);
};

/**
 * Get a status as AssetStatus type, with guards
 */
export const getValidAssetStatus = (status: string): AssetStatus => {
  const normalizedStatus = status.toUpperCase();
  
  switch (normalizedStatus) {
    case "DISPONÍVEL": return "DISPONÍVEL";
    case "ALUGADO": return "ALUGADO";
    case "ASSINATURA": return "ASSINATURA";
    case "SEM DADOS": return "SEM DADOS";
    case "BLOQUEADO": return "BLOQUEADO";
    case "MANUTENÇÃO": return "MANUTENÇÃO";
    case "EXTRAVIADO": return "extraviado";
    default: return "DISPONÍVEL"; // Default fallback
  }
};
