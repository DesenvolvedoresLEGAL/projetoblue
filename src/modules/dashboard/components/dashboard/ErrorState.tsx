
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error?: unknown;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ error, message, onRetry }: ErrorStateProps) {
  const errorMessage = message || (error instanceof Error ? error.message : "Ocorreu um erro ao carregar os dados do dashboard.");
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <AlertTriangle className="h-8 w-8 text-red-500" />
      <p className="text-red-500 font-medium">Erro ao carregar dados</p>
      <p className="text-muted-foreground max-w-md text-center">{errorMessage}</p>
      <div className="mt-4 space-y-2">
        <Button onClick={onRetry || (() => window.location.reload())} variant="default">
          Tentar Novamente
        </Button>
        <details className="mt-4 text-xs text-muted-foreground">
          <summary className="cursor-pointer">Detalhes técnicos</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-w-lg max-h-40">
            {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
