
import { z } from "zod";

// Base schema with common fields
export const baseAssetSchema = z.object({
  status_id: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? 1 : Number(val), // Default to 1 (Disponível)
    z.number().nullable().default(1)
  ),
  notes: z.string().optional(),
});

// Chip type schema 
export const chipSchema = baseAssetSchema.extend({
  solution_id: z.literal(1).or(z.literal(11)), // CHIP solution ID (support both 1 and 11)
  iccid: z.string()
    .min(1, "ICCID é obrigatório")
    .regex(/^\d{19,20}$/, { message: "ICCID deve ter 19-20 dígitos" }),
  line_number: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().nullable()
  ),
  manufacturer_id: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().min(1, "Operadora é obrigatória")
  ),
  plan_id: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().min(1, "Plano é obrigatório")
  ),
});

// Equipment type schema (was Router before)
export const equipmentSchema = baseAssetSchema.extend({
  solution_id: z.number().min(1), // Any solution ID except CHIP
  serial_number: z.string().min(1, "Número de série é obrigatório"),
  manufacturer_id: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().min(1, "Fabricante é obrigatório")
  ),
  model: z.string().min(1, "Modelo é obrigatório"),
  radio: z.string().optional(),
  
  // New optional fields
  admin_user: z.string().optional(),
  admin_pass: z.string().optional(),
  ssid: z.string().optional(),
  password: z.string().optional(), // WiFi password
});

// Combined discriminated union schema
export const assetSchema = z.discriminatedUnion("solution_id", [
  chipSchema,
  equipmentSchema
]);

// Define TypeScript types from schemas
export type ChipFormValues = z.infer<typeof chipSchema>;
export type EquipmentFormValues = z.infer<typeof equipmentSchema>;
export type AssetFormValues = z.infer<typeof assetSchema>;
