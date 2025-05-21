
import { z } from "zod";

// Common fields for both asset types
const commonFields = {
  solution_id: z.number(),
  status_id: z.number().default(1),
  notes: z.string().optional(),
  manufacturer_id: z.number().optional(),
};

// Define the schema for asset form
export const assetSchema = z.object({
  ...commonFields,
  // Fields for CHIP (solution_id: 1)
  iccid: z.string().optional(),
  line_number: z.union([z.string(), z.number()]).optional(),
  plan_id: z.number().optional(),
  
  // Fields for ROUTER/EQUIPMENT (solution_id: 2)
  serial_number: z.string().optional(),
  model: z.string().optional(),
  radio: z.string().optional(),
  admin_user: z.string().optional(),
  admin_pass: z.string().optional(),
})
.refine(
  (data) => {
    // Validate required fields based on solution_id
    if (data.solution_id === 1) { // CHIP
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

// Export type for the form values
export type AssetFormValues = z.infer<typeof assetSchema>;
