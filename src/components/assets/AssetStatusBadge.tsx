
import React from 'react';
import { Badge } from "@/components/ui/badge";

type AssetStatusBadgeProps = {
  status: string | undefined;
}

export const AssetStatusBadge = ({ status }: AssetStatusBadgeProps) => {
  // Handle undefined or null status
  if (!status) {
    return <Badge variant="outline">Desconhecido</Badge>;
  }
  
  // Now we can safely use toLowerCase()
  switch (status.toUpperCase()) {
    case "DISPONÍVEL":
    case "DISPONIVEL":
      return <Badge className="bg-green-500">Disponível</Badge>;
    case "ALUGADO":
      return <Badge variant="outline">Alugado</Badge>;
    case "ASSINATURA":
      return <Badge variant="secondary">Assinatura</Badge>;
    case "SEM DADOS":
      return <Badge variant="outline">Sem Dados</Badge>;
    case "BLOQUEADO":
      return <Badge variant="destructive">Bloqueado</Badge>;
    case "MANUTENÇÃO":
    case "MANUTENCAO":
      return <Badge variant="warning">Manutenção</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default AssetStatusBadge;
