
import { toast as sonnerToast } from "sonner";

type ToastOptions = Parameters<typeof sonnerToast.success>[1];

interface ToastWithTypes {
  (message: string, options?: ToastOptions): void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
}

const toast: ToastWithTypes = (message, options) => {
  return sonnerToast(message, {
    ...options,
    style: {
      ...options?.style,
    },
  });
};

toast.success = (message, options) => {
  return sonnerToast.success(message, {
    ...options,
    style: {
      ...options?.style,
    },
  });
};

toast.error = (message, options) => {
  return sonnerToast.error(message, {
    ...options,
    style: {
      ...options?.style,
    },
  });
};

toast.warning = (message, options) => {
  return sonnerToast(message, {
    ...options,
    style: {
      ...options?.style,
    },
    icon: '⚠️',
  });
};

toast.info = (message, options) => {
  return sonnerToast.info(message, {
    ...options,
    style: {
      ...options?.style,
    },
  });
};

export { toast };
