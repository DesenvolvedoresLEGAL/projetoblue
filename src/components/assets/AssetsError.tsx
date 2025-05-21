
import React from 'react';
import { Button } from "@/components/ui/button";

interface AssetsErrorProps {
  error: Error | null;
  refetch: () => void;
}

const AssetsError = ({ error, refetch }: AssetsErrorProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Inventário de Ativos</h1>
      </div>
      <div className="p-6 border rounded-md bg-red-50">
        <div className="text-red-600">
          Erro ao carregar ativos: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </div>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => refetch()}
        >
          Tentar novamente
        </Button>
      </div>
    </div>
  );
};

export default AssetsError;
