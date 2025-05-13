
import { Asset, AssetStatus, AssetType, ChipAsset, RouterAsset, StatusRecord as UIStatusRecord } from "@/types/asset";
import { AssetRecord, StatusRecord } from "@/types/assetDatabase";

// Map status_id to AssetStatus UI type
export const mapStatusIdToAssetStatus = (statusId: number, statusRecords: UIStatusRecord[]): AssetStatus => {
  const found = statusRecords.find(s => s.id === statusId);
  if (found) {
    switch (found.nome.toLowerCase()) {
      case 'disponivel': return 'DISPONÍVEL';
      case 'alugado': return 'ALUGADO';
      case 'assinatura': return 'ASSINATURA';
      case 'sem dados': return 'SEM DADOS';
      case 'bloqueado': return 'BLOQUEADO';
      case 'em manutenção': return 'MANUTENÇÃO';
      default: return 'DISPONÍVEL';
    }
  }
  return 'DISPONÍVEL'; // Default fallback
};

// Map AssetStatus UI type to status_id
export const mapAssetStatusToId = (status: AssetStatus, statusRecords: UIStatusRecord[]): number => {
  const statusMap: Record<AssetStatus, string> = {
    'DISPONÍVEL': 'disponivel',
    'ALUGADO': 'alugado',
    'ASSINATURA': 'assinatura',
    'SEM DADOS': 'sem dados',
    'BLOQUEADO': 'bloqueado',
    'MANUTENÇÃO': 'em manutenção'
  };
  
  const found = statusRecords.find(s => s.nome.toLowerCase() === statusMap[status].toLowerCase());
  return found ? found.id : 1; // Default to 'Disponível' (id=1) if not found
};

// Convert database record to UI asset object
export const convertToAssetObject = (asset: AssetRecord, statusRecords: UIStatusRecord[]): Asset => {
  const baseAsset = {
    id: asset.uuid,
    registrationDate: asset.created_at || new Date().toISOString(),
    status: mapStatusIdToAssetStatus(asset.status_id, statusRecords),
    statusId: asset.status_id,
    notes: asset.observacoes
  };
  
  if (asset.type_id === 1) {
    // É um chip
    return {
      ...baseAsset,
      type: "CHIP" as const,
      iccid: asset.iccid || '',
      phoneNumber: asset.line_number?.toString() || '',
      carrier: asset.manufacturer_id?.toString() || ''
    } as ChipAsset;
  } else {
    // É um roteador
    return {
      ...baseAsset,
      type: "ROTEADOR" as const,
      uniqueId: asset.uuid,
      brand: asset.manufacturer_id?.toString() || '',
      model: asset.model || '',
      ssid: '', // Não temos esses dados no schema atual
      password: asset.password || '',
      ipAddress: '', // Não temos esses dados no schema atual
      adminUser: '', // Não temos esses dados no schema atual
      adminPassword: '', // Não temos esses dados no schema atual
      imei: '', // Não temos esses dados no schema atual
      serialNumber: asset.serial_number || ''
    } as RouterAsset;
  }
};

// Convert UI asset to database record structure
export const convertAssetToDbRecord = (asset: Asset): Partial<AssetRecord> => {
  const record: Partial<AssetRecord> = {
    uuid: asset.id,
    status_id: asset.statusId,
    observacoes: asset.notes,
    type_id: asset.type === "CHIP" ? 1 : 2,
  };

  if (asset.type === "CHIP") {
    const chipData = asset as ChipAsset;
    record.iccid = chipData.iccid;
    record.line_number = chipData.phoneNumber ? parseInt(chipData.phoneNumber) : undefined;
    record.manufacturer_id = chipData.carrier ? parseInt(chipData.carrier) : undefined;
  } else {
    const routerData = asset as RouterAsset;
    record.manufacturer_id = routerData.brand ? parseInt(routerData.brand) : undefined;
    record.model = routerData.model;
    record.password = routerData.password;
    record.serial_number = routerData.serialNumber;
  }

  return record;
};
