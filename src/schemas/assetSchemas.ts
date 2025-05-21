
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
}).refine((data) => {
  // Validate fields based on whether it's a chip or not
  const isChip = data.solution_id === 1 || data.solution_id === 11;
  
  if (isChip) {
    // Chip specific validation
    return data.hasOwnProperty('iccid') && 
           (data as any).iccid && 
           data.hasOwnProperty('plan_id') && 
           (data as any).plan_id;
  } else {
    // Equipment specific validation
    return data.hasOwnProperty('serial_number') &&
           (data as any).serial_number && 
           data.hasOwnProperty('model') && 
           (data as any).model;
  }
}, {
  message: "Campos obrigatórios não preenchidos para o tipo de ativo selecionado",
  path: ["solution_id"]
});

// Chip type schema - extends the base schema with chip-specific fields
export const chipSchema = assetSchema.extend({
  iccid: z.string()
    .min(1, "ICCID é obrigatório")
    .regex(/^\d{19,20}$/, { message: "ICCID deve ter 19-20 dígitos" }),
  line_number: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().nullable()
  ),
  plan_id: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().min(1, "Plano é obrigatório")
  ),
});

// Equipment type schema - extends the base schema with equipment-specific fields
export const equipmentSchema = assetSchema.extend({
  serial_number: z.string().min(1, "Número de série é obrigatório"),
  model: z.string().min(1, "Modelo é obrigatório"),
  radio: z.string().optional(),
  admin_user: z.string().optional().default("admin"),
  admin_pass: z.string().optional().default(""),
  ssid: z.string().optional(),
  password: z.string().optional(),
});

// Define TypeScript types from schemas
export type AssetFormValues = z.infer<typeof assetSchema>;
export type ChipFormValues = z.infer<typeof chipSchema>;
export type EquipmentFormValues = z.infer<typeof equipmentSchema>;
