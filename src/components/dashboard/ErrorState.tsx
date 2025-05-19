
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao carregar os dados do dashboard.";
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <AlertTriangle className="h-8 w-8 text-red-500" />
      <p className="text-red-500 font-medium">Erro ao carregar dados</p>
      <p className="text-muted-foreground">{errorMessage}</p>
      <Button onClick={onRetry || (() => window.location.reload())} variant="outline">
        Tentar Novamente
      </Button>
    </div>
  );
}
