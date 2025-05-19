
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Carregando dados do dashboard..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-[#4D2BFB]" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
