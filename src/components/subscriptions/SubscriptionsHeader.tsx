
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowDownToLine } from "lucide-react";

interface SubscriptionsHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedAssets: string[];
  handleReturnToStock: () => void;
}

export const SubscriptionsHeader: React.FC<SubscriptionsHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  selectedAssets,
  handleReturnToStock,
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Assinaturas</h1>
          <p className="text-gray-500">Controle e monitore assinaturas e aluguéis de ativos</p>
        </div>
        
        {selectedAssets.length > 0 && (
          <Button 
            variant="destructive" 
            onClick={handleReturnToStock}
            className="flex items-center"
          >
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Retornar {selectedAssets.length} ativo(s) ao estoque
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por cliente, ativo ou evento..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};
