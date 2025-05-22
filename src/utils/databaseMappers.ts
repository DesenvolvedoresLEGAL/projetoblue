
import { Asset, AssetStatus, AssetType, ChipAsset, RouterAsset, SolutionType } from "@/types/asset";
import { SOLUTION_IDS, getValidAssetStatus } from "./assetUtils";

// Map database status ID to frontend AssetStatus
export const mapStatusIdToAssetStatus = (statusId: number, statusName?: string): AssetStatus => {
  // If we have the status name, use it to determine the frontend status
  if (statusName) {
    switch (statusName.toLowerCase()) {
      case 'disponivel': return "DISPONÍVEL";
      case 'alugado': return "ALUGADO";
      case 'assinatura': return "ASSINATURA";
      case 'sem dados': return "SEM DADOS";
      case 'bloqueado': return "BLOQUEADO";
      case 'em manutenção':
      case 'manutencao': return "MANUTENÇÃO";
    }
  }
  
  // Fallback to ID-based mapping
  switch (statusId) {
    case 1: return "DISPONÍVEL";
    case 2: return "ALUGADO";
    case 3: return "ASSINATURA";
    case 4: return "SEM DADOS";
    case 5: return "BLOQUEADO";
    case 6: return "MANUTENÇÃO";
    default: return "DISPONÍVEL";
  }
};

// Map database solution to AssetType based on solution_id
export const mapSolutionIdToAssetType = (solutionId: number, solutionName?: string): AssetType => {
  // Assume solution_id values: 1 for CHIP, 2 for ROTEADOR
  // You might need to adjust these IDs based on your actual data
  return solutionId === 1 ? 'CHIP' : 'ROTEADOR';
};

// Map database solution to frontend SolutionType
export const mapSolutionToSolutionType = (solution?: string): SolutionType | undefined => {
  if (!solution) return undefined;
  
  switch (solution.toUpperCase()) {
    case 'SPEEDY 5G': return 'SPEEDY 5G';
    case '4BLACK': return '4BLACK';
    case '4LITE': return '4LITE';
    case '4PLUS': return '4PLUS';
    case 'AP BLUE': return 'AP BLUE';
    case 'POWERBANK': return 'POWERBANK';
    case 'SWITCH': return 'SWITCH';
    case 'HUB USB': return 'HUB USB';
    case 'ANTENA': return 'ANTENA';
    case 'LOAD BALANCE': return 'LOAD BALANCE';
    default: return undefined;
  }
};

// Map database asset record to frontend Asset type
export const mapDatabaseAssetToFrontend = (dbAsset: any): Asset => {
  if (!dbAsset) return null;

  // Extract nested data if available
  const statusName = dbAsset?.asset_status?.status || dbAsset?.status?.status;
  const solutionName = dbAsset?.asset_solutions?.solution || dbAsset?.solucao?.solution;
  
  // Determine asset type based on solution_id or presence of specific fields
  const isChip = dbAsset.solution_id === SOLUTION_IDS.CHIP || !!dbAsset.iccid;
  const type = isChip ? 'CHIP' : 'ROTEADOR';
  const status = mapStatusIdToAssetStatus(dbAsset.status_id, statusName);
  
  // Common asset properties
  const baseAsset = {
    id: dbAsset.uuid || dbAsset.id,
    type,
    status,
    statusId: dbAsset.status_id,
    registrationDate: dbAsset.created_at || new Date().toISOString(),
    notes: dbAsset.notes,
    lastSeen: dbAsset.last_seen,
    isOnline: dbAsset.is_online,
    solucao: mapSolutionToSolutionType(solutionName),
    marca: dbAsset.manufacturers?.name || dbAsset.manufacturer?.name || dbAsset.manufacturer_id?.toString(),
    modelo: dbAsset.model,
    serial_number: dbAsset.serial_number,
    dias_alugada: dbAsset.rented_days,
    radio: dbAsset.radio
  };
  
  if (type === 'CHIP') {
    return {
      ...baseAsset,
      iccid: dbAsset.iccid || '',
      phoneNumber: dbAsset.line_number?.toString() || '',
      carrier: dbAsset.manufacturers?.name || dbAsset.manufacturer?.name || 'Unknown',
      num_linha: dbAsset.line_number
    } as ChipAsset;
  } else {
    return {
      ...baseAsset,
      uniqueId: dbAsset.uuid,
      brand: dbAsset.manufacturers?.name || dbAsset.manufacturer?.name || '',
      model: dbAsset.model || '',
      ssid: dbAsset.ssid || '',
      password: dbAsset.password || '',
      serialNumber: dbAsset.serial_number || '',
      ipAddress: dbAsset.ip_address,
      adminUser: dbAsset.admin_user,
      adminPassword: dbAsset.admin_pass || dbAsset.admin_password,
      imei: dbAsset.imei
    } as RouterAsset;
  }
};

// Map frontend AssetStatus to database status ID
export const mapAssetStatusToId = (status: AssetStatus): number => {
  switch (status) {
    case "DISPONÍVEL": return 1;
    case "ALUGADO": return 2;
    case "ASSINATURA": return 3;
    case "SEM DADOS": return 4;
    case "BLOQUEADO": return 5;
    case "MANUTENÇÃO": return 6;
    default: return 1;
  }
};
