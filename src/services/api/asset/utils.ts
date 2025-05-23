
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/toast";
import { Asset } from "@/types/asset";

// Helper function to handle API errors
export const handleAssetError = (error: any, message: string): void => {
  console.error(`${message}:`, error);
  toast.error(message);
};

// Helper function to map database asset to Asset type
export const mapAssetFromDb = (dbAsset: any): Asset => {
  const baseAsset = {
    id: dbAsset.uuid,
    type: dbAsset.solution_id === 11 ? "CHIP" as const : "ROTEADOR" as const,
    registrationDate: dbAsset.created_at,
    status: dbAsset.asset_status?.status || "DISPONÍVEL" as const,
    statusId: dbAsset.status_id,
    notes: dbAsset.notes,
    clientId: dbAsset.client_id,
    solucao: dbAsset.asset_solutions?.solution,
    marca: dbAsset.manufacturers?.name,
    modelo: dbAsset.model,
    serial_number: dbAsset.serial_number,
    dias_alugada: dbAsset.rented_days,
    radio: dbAsset.radio,
  };

  if (dbAsset.solution_id === 11) {
    // CHIP asset
    return {
      ...baseAsset,
      type: "CHIP",
      iccid: dbAsset.iccid,
      phoneNumber: dbAsset.line_number?.toString() || "",
      carrier: "Unknown",
      num_linha: dbAsset.line_number,
    };
  } else {
    // ROUTER asset  
    return {
      ...baseAsset,
      type: "ROTEADOR",
      uniqueId: dbAsset.uuid,
      brand: dbAsset.manufacturers?.name || "",
      model: dbAsset.model || "",
      ssid: "",
      password: "",
      serialNumber: dbAsset.serial_number,
      adminUser: dbAsset.admin_user,
      adminPassword: dbAsset.admin_pass,
    };
  }
};
