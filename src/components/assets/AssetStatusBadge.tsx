
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { isSameStatus } from '@/utils/assetUtils';

type AssetStatusBadgeProps = {
  status: string | undefined;
}

export const AssetStatusBadge = ({ status }: AssetStatusBadgeProps) => {
  // Handle undefined or null status
  if (!status) {
    return (
      <Badge 
        variant="outline" 
        className="border-gray-300 text-gray-600 font-bold font-neue-haas"
      >
        Status Desconhecido
      </Badge>
    );
  }
  
  // Disponível - Legal Primary Color
  if (isSameStatus(status, "DISPONÍVEL")) {
    return (
      <Badge 
        className="bg-legal-primary text-white font-bold font-neue-haas shadow-sm hover:bg-legal-dark transition-colors duration-200"
      >
        ✓ Disponível
      </Badge>
    );
  }
  
  // Em Locação - Legal Secondary Color
  if (isSameStatus(status, "EM LOCAÇÃO")) {
    return (
      <Badge 
        className="bg-legal-secondary text-legal-dark font-bold font-neue-haas shadow-sm hover:bg-legal-secondary/80 transition-colors duration-200"
      >
        📍 Em Locação
      </Badge>
    );
  }
  
  // Em Assinatura - Legal Secondary with gradient
  if (isSameStatus(status, "EM ASSINATURA")) {
    return (
      <Badge 
        className="bg-gradient-to-r from-legal-secondary to-legal-primary text-white font-bold font-neue-haas shadow-sm hover:from-legal-secondary/80 hover:to-legal-primary/80 transition-all duration-200"
      >
        📋 Em Assinatura
      </Badge>
    );
  }
  
  // Sem Dados - Warning style with Legal colors
  if (isSameStatus(status, "SEM DADOS")) {
    return (
      <Badge 
        className="bg-amber-100 border-2 border-legal-secondary text-legal-dark font-bold font-neue-haas shadow-sm hover:bg-amber-50 transition-colors duration-200"
      >
        ⚠️ Sem Dados
      </Badge>
    );
  }
  
  // Bloqueado - Error style
  if (isSameStatus(status, "BLOQUEADO")) {
    return (
      <Badge 
        variant="destructive" 
        className="bg-red-600 text-white font-bold font-neue-haas shadow-sm hover:bg-red-700 transition-colors duration-200"
      >
        🚫 Bloqueado
      </Badge>
    );
  }
  
  // Em Manutenção - Info style with Legal colors
  if (isSameStatus(status, "EM MANUTENÇÃO")) {
    return (
      <Badge 
        className="bg-legal-dark text-white font-bold font-neue-haas shadow-sm hover:bg-legal-dark/80 transition-colors duration-200"
      >
        🔧 Em Manutenção
      </Badge>
    );
  }
  
  // Default - using Legal secondary
  return (
    <Badge 
      className="bg-legal-secondary/20 text-legal-dark border border-legal-secondary font-bold font-neue-haas shadow-sm"
    >
      {status}
    </Badge>
  );
};

export default AssetStatusBadge;
