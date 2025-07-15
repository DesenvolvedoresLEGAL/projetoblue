
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Save, X } from "lucide-react";

interface ClientFormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isFormValid: boolean;
}

export const ClientFormActions: React.FC<ClientFormActionsProps> = ({
  onCancel,
  isLoading,
  isFormValid
}) => {
  return (
    <div className="flex gap-3 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-neue-haas"
      >
        <X className="h-4 w-4 mr-2" />
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="flex-1 bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white font-neue-haas font-bold"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Cadastrar Cliente
          </>
        )}
      </Button>
    </div>
  );
};
