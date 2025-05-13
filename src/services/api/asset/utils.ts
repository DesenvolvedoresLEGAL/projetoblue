
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/toast";

// Helper function to handle API errors
export const handleAssetError = (error: any, message: string): void => {
  console.error(`${message}:`, error);
  toast.error(message);
};
