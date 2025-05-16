
import { z } from "zod";

// Schema comum para transformação de dados
export const transformStringToNumber = (val: string | null | undefined) => {
  if (val === null || val === undefined || val === "") return null;
  const num = parseInt(val);
  return isNaN(num) ? null : num;
};

// Schemas de validação refinados
export const chipSchema = z.object({
  type_id: z.literal(1),
  line_number: z.string()
    .optional()
    .transform(val => val ? parseInt(val) : null)
    .refine(val => val === null || !isNaN(Number(val)), "Número da linha deve ser um número válido"),
  iccid: z.string()
    .min(19, "ICCID deve ter entre 19 e 20 dígitos")
    .max(20, "ICCID deve ter entre 19 e 20 dígitos")
    .regex(/^\d{19,20}$/, "ICCID deve conter apenas números"),
  model: z.string().default("NANOSIM"),
  plan_id: z.string()
    .optional()
    .transform(transformStringToNumber),
  manufacturer_id: z.string()
    .transform(transformStringToNumber)
    .refine(val => val !== null, "Fabricante é obrigatório"),
  status_id: z.string()
    .transform(transformStringToNumber)
    .refine(val => val !== null, "Status é obrigatório"),
});

export const speedySchema = z.object({
  type_id: z.literal(2),
  serial_number: z.string().optional(),
  model: z.string().min(1, "Modelo é obrigatório"),
  rented_days: z.string()
    .transform(val => val && val.trim() !== "" ? parseInt(val) : 0)
    .refine(val => !isNaN(val) && val >= 0, "Dias alugados deve ser maior ou igual a 0"),
  radio: z.string().optional(),
  password: z.string().optional(),
  manufacturer_id: z.string()
    .transform(transformStringToNumber)
    .refine(val => val !== null, "Fabricante é obrigatório"),
  status_id: z.string()
    .transform(transformStringToNumber)
    .refine(val => val !== null, "Status é obrigatório"),
  solution_id: z.string()
    .optional()
    .transform(transformStringToNumber),
});

// Schema discriminado usando type_id como discriminator
export const assetSchema = z.discriminatedUnion("type_id", [chipSchema, speedySchema]);

export type AssetFormData = z.infer<typeof assetSchema>;
