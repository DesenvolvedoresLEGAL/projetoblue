
import { z } from "zod";

// Schema corrigido para alinhar com estrutura do banco de dados
export const assetSchema = z.object({
  solution_id: z.number(), // Obrigatório no banco
  status_id: z.number().default(1),
  manufacturer_id: z.number().optional(),
  plan_id: z.number().optional(),
  
  // Campos para CHIP (solution_id: 11)
  iccid: z.string().optional(),
  line_number: z.number().optional(), // Corrigido para number apenas
  
  // Campos para ROUTER/EQUIPMENT (solution_id: 2)
  serial_number: z.string().optional(),
  model: z.string().optional(),
  radio: z.string().optional(),
  admin_user: z.string().default("admin"),
  admin_pass: z.string().optional(),
  
  // Campos comuns
  rented_days: z.number().default(0),
  notes: z.string().optional(),
})
.refine(
  (data) => {
    // Validação baseada no solution_id
    if (data.solution_id === 11) { // CHIP
      return !!data.iccid;
    } else if (data.solution_id === 2) { // ROUTER/EQUIPMENT
      return !!data.serial_number && !!data.model;
    }
    return true;
  },
  {
    message: "Missing required fields for selected asset type",
    path: ["solution_id"],
  }
);

// Schema para associação asset-cliente
export const assetClientAssocSchema = z.object({
  asset_id: z.string(),
  client_id: z.string(),
  entry_date: z.string(),
  exit_date: z.string().optional(),
  association_id: z.number(),
  plan_id: z.number(),
  notes: z.string().optional(),
  pass: z.string().optional(),
  gb: z.number().default(0),
  ssid: z.string().optional(),
});

// Schema para cliente corrigido
export const clientSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().min(1, "CNPJ é obrigatório"),
  email: z.string().email().optional(),
  contato: z.number().positive("Contato deve ser um número válido"),
});

// Export type for the form values
export type AssetFormValues = z.infer<typeof assetSchema>;
export type AssetClientAssocFormValues = z.infer<typeof assetClientAssocSchema>;
export type ClientFormValues = z.infer<typeof clientSchema>;
