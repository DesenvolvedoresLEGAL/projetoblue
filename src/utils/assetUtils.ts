
import { AssetStatus, Asset } from "@/types/asset";

export const SOLUTION_IDS = {
  CHIP: 11,
  SPEEDY_5G: 1
};

export const getAssetIdentifier = (asset: Partial<Asset> | null | undefined): string => {
  if (!asset) return 'N/A';
  
  if (asset.solution_id === SOLUTION_IDS.CHIP || 
      asset.type === 'CHIP' || 
      asset.solucao === 'CHIP') {
    return asset.line_number ? String(asset.line_number) : (asset.iccid || 'N/A');
  }
  
  return asset.radio || asset.serial_number || 'N/A';
};

export const getAssetType = (asset: Partial<Asset> | null | undefined): string => {
  if (!asset) return 'Desconhecido';
  
  if (asset.solution_id === SOLUTION_IDS.CHIP) return 'CHIP';
  if (asset.solution_id === SOLUTION_IDS.SPEEDY_5G) return 'SPEEDY 5G';
  
  return asset.type || 
         (asset.solucao?.solution || asset.solution || 'Equipamento');
};

export const normalizeAsset = (asset: Partial<Asset> | null | undefined) => {
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

export const isSameStatus = (status1: string | undefined, status2: string | undefined): boolean => {
  if (!status1 || !status2) return false;
  return status1.toUpperCase() === status2.toUpperCase();
};

export const isValidAssetStatus = (status: string): status is AssetStatus => {
  const validStatuses: AssetStatus[] = [
    "DISPONÍVEL", "ALUGADO", "ASSINATURA", "SEM DADOS", "BLOQUEADO", "MANUTENÇÃO", "EXTRAVIADO"
  ];
  return validStatuses.includes(status as AssetStatus);
};

export const getValidAssetStatus = (status: string): AssetStatus => {
  const normalizedStatus = status.toUpperCase();
  
  switch (normalizedStatus) {
    case "DISPONÍVEL": return "DISPONÍVEL";
    case "ALUGADO": return "ALUGADO";
    case "ASSINATURA": return "ASSINATURA";
    case "SEM DADOS": return "SEM DADOS";
    case "BLOQUEADO": return "BLOQUEADO";
    case "MANUTENÇÃO": return "MANUTENÇÃO";
    case "EXTRAVIADO": return "EXTRAVIADO";
    default: return "DISPONÍVEL";
  }
};
