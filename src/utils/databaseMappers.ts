
import { Asset, AssetStatus, AssetType, ChipAsset, EquipamentAsset, SolutionType, Client, AssetClientAssociation } from "@/types/asset";
import { SOLUTION_IDS, getValidAssetStatus } from "./assetUtils";

// Map database status ID to frontend AssetStatus
export const mapStatusIdToAssetStatus = (statusId: number, statusName?: string): AssetStatus => {
  if (statusName) {
    switch (statusName.toLowerCase()) {
      case 'disponivel':
      case 'disponível': return "DISPONÍVEL";
      case 'alugado': return "ALUGADO";
      case 'assinatura': return "ASSINATURA";
      case 'sem dados': return "SEM DADOS";
      case 'bloqueado': return "BLOQUEADO";
      case 'em manutenção':
      case 'manutencao': return "MANUTENÇÃO";
      case 'extraviado': return "EXTRAVIADO";
    }
  }
  
  switch (statusId) {
    case 1: return "DISPONÍVEL";
    case 2: return "ALUGADO";
    case 3: return "ASSINATURA";
    case 4: return "SEM DADOS";
    case 5: return "BLOQUEADO";
    case 6: return "MANUTENÇÃO";
    case 7: return "EXTRAVIADO";
    default: return "DISPONÍVEL";
  }
};

// Map database solution to AssetType based on solution_id
export const mapSolutionIdToAssetType = (solutionId: number): AssetType => {
  return solutionId === 11 ? 'CHIP' : 'ROTEADOR';
};

// Map database solution to frontend SolutionType
export const mapSolutionToSolutionType = (solution?: string): SolutionType | undefined => {
  if (!solution) return undefined;
  
  const solutionUpper = solution.toUpperCase();
  const validSolutions: SolutionType[] = [
    'SPEEDY 5G', '4BLACK', '4LITE', '4PLUS', 'AP BLUE', 
    'POWERBANK', 'SWITCH', 'HUB USB', 'ANTENA', 'LOAD BALANCE', 'CHIP'
  ];
  
  return validSolutions.find(s => s === solutionUpper);
};

// Map database asset record to frontend Asset type
export const mapDatabaseAssetToFrontend = (dbAsset: any): Asset => {
  if (!dbAsset) return null;

  const statusName = dbAsset?.asset_status?.status || dbAsset?.status?.status;
  const solutionName = dbAsset?.asset_solutions?.solution || dbAsset?.solucao?.solution;
  
  const isChip = dbAsset.solution_id === SOLUTION_IDS.CHIP;
  const type: AssetType = isChip ? 'CHIP' : 'ROTEADOR';
  const status = mapStatusIdToAssetStatus(dbAsset.status_id, statusName);
  
  const baseAsset = {
    id: dbAsset.uuid || dbAsset.id,
    uuid: dbAsset.uuid,
    type,
    status,
    statusId: dbAsset.status_id,
    registrationDate: dbAsset.created_at || new Date().toISOString(),
    notes: dbAsset.notes,
    lastSeen: dbAsset.last_seen,
    isOnline: dbAsset.is_online,
    solucao: mapSolutionToSolutionType(solutionName),
    marca: dbAsset.manufacturers?.name || dbAsset.manufacturer?.name,
    modelo: dbAsset.model,
    serial_number: dbAsset.serial_number,
    dias_alugada: dbAsset.rented_days,
    radio: dbAsset.radio,
    solution_id: dbAsset.solution_id,
    manufacturer_id: dbAsset.manufacturer_id,
    plan_id: dbAsset.plan_id,
    rented_days: dbAsset.rented_days,
    admin_user: dbAsset.admin_user,
    admin_pass: dbAsset.admin_pass,
    // Campos de configurações de rede
    ssid_fabrica: dbAsset.ssid_fabrica,
    pass_fabrica: dbAsset.pass_fabrica,
    admin_user_fabrica: dbAsset.admin_user_fabrica,
    admin_pass_fabrica: dbAsset.admin_pass_fabrica,
    ssid_atual: dbAsset.ssid_atual,
    pass_atual: dbAsset.pass_atual,
    created_at: dbAsset.created_at,
    updated_at: dbAsset.updated_at,
    deleted_at: dbAsset.deleted_at
  };
  
  if (type === 'CHIP') {
    return {
      ...baseAsset,
      iccid: dbAsset.iccid || '',
      phoneNumber: dbAsset.line_number?.toString() || '',
      carrier: dbAsset.manufacturers?.name || dbAsset.manufacturer?.name || 'Unknown',
      line_number: dbAsset.line_number
    } as ChipAsset;
  } else {
    return {
      ...baseAsset,
      uniqueId: dbAsset.uuid,
      brand: dbAsset.manufacturers?.name || dbAsset.manufacturer?.name || '',
      model: dbAsset.model || '',
      ssid: dbAsset.ssid_atual || '', // Usar campo atual do banco
      password: dbAsset.pass_atual || '', // Usar campo atual do banco
      serialNumber: dbAsset.serial_number || '',
      ipAddress: dbAsset.ip_address,
      adminUser: dbAsset.admin_user,
      adminPassword: dbAsset.admin_pass,
      imei: dbAsset.imei
    } as EquipamentAsset;
  }
};

// Map database client record to frontend Client type - corrigido conforme banco
export const mapDatabaseClientToFrontend = (dbClient: any): Client => {
  if (!dbClient) return null;
  
  return {
    uuid: dbClient.uuid, // Campo principal no banco
    nome: dbClient.nome,
    cnpj: dbClient.cnpj, // Nullable no banco
    email: dbClient.email,
    contato: dbClient.contato, // bigint no banco
    created_at: dbClient.created_at,
    updated_at: dbClient.updated_at,
    deleted_at: dbClient.deleted_at
    // Removido campo 'id' e 'assets' que não existem no banco
  };
};

// Map database asset_client_assoc to frontend type - corrigido conforme banco
export const mapDatabaseAssocToFrontend = (dbAssoc: any): AssetClientAssociation => {
  if (!dbAssoc) return null;
  
  return {
    id: dbAssoc.id, // bigint sequence
    asset_id: dbAssoc.asset_id, // text NOT NULL
    client_id: dbAssoc.client_id, // text NOT NULL
    entry_date: dbAssoc.entry_date, // date NOT NULL
    exit_date: dbAssoc.exit_date, // date nullable
    association_id: dbAssoc.association_id, // bigint NOT NULL
    plan_id: dbAssoc.plan_id, // bigint nullable
    notes: dbAssoc.notes,
    pass: dbAssoc.pass,
    gb: dbAssoc.gb, // bigint com default 0
    ssid: dbAssoc.ssid,
    created_at: dbAssoc.created_at,
    updated_at: dbAssoc.updated_at,
    deleted_at: dbAssoc.deleted_at
  };
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
    case "EXTRAVIADO": return 7;
    default: return 1;
  }
};

// Map frontend data to database format for creation/update
export const mapFrontendToDatabase = (frontendData: any, isUpdate: boolean = false) => {
  const dbData: any = {};
  
  if (frontendData.statusId !== undefined) dbData.status_id = frontendData.statusId;
  if (frontendData.solution_id !== undefined) dbData.solution_id = frontendData.solution_id;
  if (frontendData.manufacturer_id !== undefined) dbData.manufacturer_id = frontendData.manufacturer_id;
  if (frontendData.plan_id !== undefined) dbData.plan_id = frontendData.plan_id;
  if (frontendData.notes !== undefined) dbData.notes = frontendData.notes;
  
  if (frontendData.iccid !== undefined) dbData.iccid = frontendData.iccid;
  if (frontendData.line_number !== undefined) dbData.line_number = frontendData.line_number;
  if (frontendData.serial_number !== undefined) dbData.serial_number = frontendData.serial_number;
  if (frontendData.model !== undefined) dbData.model = frontendData.model;
  if (frontendData.radio !== undefined) dbData.radio = frontendData.radio;
  if (frontendData.admin_user !== undefined) dbData.admin_user = frontendData.admin_user;
  if (frontendData.admin_pass !== undefined) dbData.admin_pass = frontendData.admin_pass;
  if (frontendData.rented_days !== undefined) dbData.rented_days = frontendData.rented_days;
  
  // Campos de configurações de rede - atuais (editáveis)
  if (frontendData.ssid_atual !== undefined) dbData.ssid_atual = frontendData.ssid_atual;
  if (frontendData.pass_atual !== undefined) dbData.pass_atual = frontendData.pass_atual;
  
  return dbData;
};
