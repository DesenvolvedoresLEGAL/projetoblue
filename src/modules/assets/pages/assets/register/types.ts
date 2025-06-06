
import { z } from "zod";
import { chipSchema, equipmentSchema } from "./schemas";

export type ChipFormValues = z.infer<typeof chipSchema>;
export type EquipmentFormValues = z.infer<typeof equipmentSchema>;
