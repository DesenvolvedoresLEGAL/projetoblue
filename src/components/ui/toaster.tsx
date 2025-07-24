
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="bottom-right"
      toastOptions={{
        className: "border-border bg-background text-foreground",
        duration: 4 * 1000, // 4 seconds
      }}
    />
  );
}
