
import { z } from "zod";

// Base schema with common fields for all assets
export const assetSchema = z.object({
  solution_id: z.number().min(1, "Solução é obrigatória"),
  status_id: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? 1 : Number(val), // Default to 1 (Disponível)
    z.number().nullable().default(1)
  ),
  notes: z.string().optional(),
  manufacturer_id: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().min(1, "Fabricante/Operadora é obrigatória")
  ),
  // Chip specific fields
  iccid: z.string().optional(),
  line_number: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().nullable().optional()
  ),
  plan_id: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().nullable().optional()
  ),
  // Equipment specific fields
  serial_number: z.string().optional(),
  model: z.string().optional(),
  radio: z.string().optional(),
  admin_user: z.string().optional().default("admin"),
  admin_pass: z.string().optional().default(""),
  ssid: z.string().optional(),
  password: z.string().optional(),
}).refine((data) => {
  // Validate fields based on whether it's a chip or not
  const isChip = data.solution_id === 1 || data.solution_id === 11;
  
  if (isChip) {
    // Chip specific validation
    return !!data.iccid && !!data.plan_id;
  } else {
    // Equipment specific validation
    return !!data.serial_number && !!data.model;
  }
}, {
  message: "Campos obrigatórios não preenchidos para o tipo de ativo selecionado",
  path: ["solution_id"]
});

// Define TypeScript types from schemas
export type AssetFormValues = z.infer<typeof assetSchema>;
