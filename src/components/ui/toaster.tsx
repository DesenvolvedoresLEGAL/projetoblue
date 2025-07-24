
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="bottom-right"
      toastOptions={{
        className: "border-border bg-background text-foreground",
        duration: 3.5 * 1000, // 3.5 seconds
      }}
    />
  );
}
