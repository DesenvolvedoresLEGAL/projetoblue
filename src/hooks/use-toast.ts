
import { toast as sonnerToast } from "sonner";

type ToastProps = Parameters<typeof sonnerToast>[1];

const useToast = () => {
  const toast = (message: string, options?: ToastProps) => {
    return sonnerToast(message, {
      ...options,
    });
  };

  return {
    toast: sonnerToast,
    toasts: [] // Compatibilidade com o hook anterior
  };
};

export { useToast, sonnerToast as toast };
