import { supabase } from "@/integrations/supabase/client";

interface Manufacturer {
  name: string;
}

interface AssetSolution {
  solution: string;
}

interface Client {
  uuid: string;
  empresa: string;
  responsavel: string;
  contato: number;
  email: string;
  cnpj: string;
}

interface Equipment {
  uuid: string;
  solution_id: number;
  status_id: number;
  model: string;
  serial_number: string;
  radio: string;
  manufacturer: Manufacturer;
  asset_solutions: AssetSolution;
}

interface Chip {
  uuid: string;
  solution_id: number;
  status_id: number;
  line_number: number;
  iccid: string;
  manufacturer: Manufacturer;
  asset_solutions: AssetSolution;
}

interface AssociationType {
  id: number;
  type: string;
}

export interface AssociationsResponse {
  uuid: string;
  client_id: string;
  equipment_id: string;
  chip_id: string;
  entry_date: string;
  exit_date: string | null;
  association_type_id: number;
  plan_id: number;
  plan_gb: number;
  equipment_ssid: string;
  equipment_pass: string;
  status: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  clients: Client;
  equipment: Equipment;
  chip: Chip;
  association_types: AssociationType;
}

// Interfaces para tipagem das respostas
interface AssetLogResponse {
  uuid: string;
  user_id: string;
  asset_id: string;
  event: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any; // JSONB field
  created_at: string;
  updated_at: string;
  status_before: { status: string } | null;
  status_after: { status: string } | null;
  manufacturer: {
    manufacturer: {
      name: string;
    };
  };
}

interface AssociationLogResponse {
  uuid: string;
  user_id: string;
  event: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any; // JSONB field
  created_at: string;
  updated_at: string;
  association_client: {
    client: {
      empresa: string;
    };
  } | null;
  association_equipment: {
    equipment: {
      radio: string;
      serial_number: string;
      model: string;
    };
  } | null;
  association_chip: {
    chip: {
      iccid: number;
      line_number: number;
      manufacturer: {
        manufacturer: {
          name: string;
        };
      };
    };
  } | null;
}

// Fetch total assets count
export const fetchTotalAssets = async () => {
  return await supabase
    .from("assets")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);
};

// Fetch active clients count from associations
export const fetchActiveClients = async () => {
  return await supabase
    .from("associations")
    .select("client_id", { count: "exact", head: true })
    .eq("status", true)
    .is("deleted_at", null)
    .is("exit_date", null);
};

// Fetch assets with issues (status indicating problems)
export const fetchAssetsWithIssues = async () => {
  return await supabase
    .from("assets")
    .select("*", { count: "exact", head: true })
    .in("status_id", [5, 6, 4]) // BLOQUEADO, MANUTENÇÃO, SEM DADOS
    .is("deleted_at", null);
};

// Fetch recent assets (last 30 days)
export const fetchRecentAssets = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await supabase
    .from("assets")
    .select(
      `
      uuid,
      radio,
      line_number,
      serial_number,
      iccid,
      solution_id,
      status_id,
      created_at
    `
    )
    .gte("created_at", thirtyDaysAgo.toISOString())
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(10);
};

// Fetch recent events from asset_logs and association_logs
export const fetchRecentEvents = async () => {
  try {
    // Query para asset_logs
    const recentAssetsQuery = supabase
      .from("asset_logs")
      .select(
        `
        uuid,
        user_id,
        asset_id,
        event,
        details,
        created_at,
        updated_at,
        status_before:asset_status!asset_logs_status_before_id_fkey(status),
        status_after:asset_status!asset_logs_status_after_id_fkey(status),
        manufacturer:assets!asset_logs_asset_id_fkey(
          manufacturer:manufacturers!assets_manufacturer_id_fkey(name)
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(5);

    // Query para association_logs
    const recentAssociationsQuery = supabase
      .from("association_logs")
      .select(
        `
        uuid,
        user_id,
        event,
        details,
        created_at,
        updated_at,
        association_client:associations!association_logs_association_uuid_fkey(
          client:clients(empresa)
        ),
      association_equipment:associations!association_logs_association_uuid_fkey(
        equipment:assets!equipment_id_fkey(
          radio,
          serial_number,
          model
        )
      ),
      association_chip:associations!association_logs_association_uuid_fkey(
        chip:assets!chip_id_fkey(
          iccid,
          line_number,
          manufacturer:manufacturers!assets_manufacturer_id_fkey(name)
        )
      )
      `
      )
      .order("created_at", { ascending: false })
      .limit(5);

    // Executar ambas as queries
    const [
      { data: recentAssetsData, error: recentAssetsError },
      { data: recentAssociationsData, error: recentAssociationsError },
    ] = await Promise.all([recentAssetsQuery, recentAssociationsQuery]);

    // Tratar erros
    if (recentAssetsError) {
     
    }

    if (recentAssociationsError) {
      console.error(
        "Error fetching recent associations:",
        recentAssociationsError
      );
    }

    // Debug log para associations (remover em produção)
    if (process.env.NODE_ENV === "development") {
     
    }

    return {
      recentAssets: (recentAssetsData as AssetLogResponse[]) || [],
      recentAssociations:
        (recentAssociationsData as unknown as AssociationLogResponse[]) || [],
    };
  } catch (error) {
   
    return {
      recentAssets: [],
      recentAssociations: [],
    };
  }
};

// Fetch status summary for chart
export const fetchStatusSummary = async () => {
  return await supabase
    .from("assets")
    .select(
      `
      status_id,
      asset_status!inner(id, status)
    `
    )
    .is("deleted_at", null);
};

// Fetch detailed status breakdown by type
export const fetchDetailedStatusBreakdown = async () => {
  return await supabase
    .from("assets")
    .select(
      `
      solution_id,
      status_id,
      asset_solutions!inner(id, solution),
      asset_status!inner(id, status)
    `
    )
    .is("deleted_at", null);
};

// Fetch solutions lookup
export const fetchSolutions = async () => {
  return await supabase.from("asset_solutions").select("*").order("solution");
};

// Fetch statuses lookup
export const fetchStatuses = async () => {
  return await supabase.from("asset_status").select("*").order("status");
};

// Fetch active associations with all related data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchActiveAssociations = async (): Promise<{data: AssociationsResponse[], error: any}> => {
const {data, error} = await supabase
  .from("associations")
  .select(
    `
    uuid,
    client_id,
    equipment_id,
    chip_id,
    entry_date,
    exit_date,
    association_type_id,
    plan_id,
    plan_gb,
    equipment_ssid,
    equipment_pass,
    status,
    notes,
    created_at,
    updated_at,
    clients!client_id_fkey(
      uuid,
      empresa,
      responsavel,
      contato,
      email,
      cnpj
    ),
    equipment:assets!equipment_id_fkey(
      uuid,
      solution_id,
      status_id,
      model,
      serial_number,
      radio,
      asset_solutions!inner(solution),
      manufacturer:manufacturers!inner(name)
    ),
    chip:assets!chip_id_fkey(
      uuid,
      solution_id,
      status_id,
      line_number,
      iccid,
      asset_solutions!fk_assets_solutions(solution),
      manufacturer:manufacturers!assets_manufacturer_id_fkey(name)
    ),
    association_types!association_type_id_fkey(
      id,
      type
    )
  `
  )
  .eq("status", true)
  .is("deleted_at", null)
  .order("created_at", { ascending: false });

  console.log('SHUSHUSHUSHUSHUHSUHSHSU')
  console.log(data)

  return {data: data, error};
};
