
import { toast as sonnerToast } from "sonner";

// Re-export sonner toast
export const toast = sonnerToast;

// Create a hook that returns the toast function
export const useToast = () => {
  return {
    toast: sonnerToast
  };
};
