
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
  switch (status.toLowerCase()) {
    case "disponível":
    case "disponivel":
      return <Badge className="bg-green-500">Disponível</Badge>;
    case "alugado":
      return <Badge variant="outline">Alugado</Badge>;
    case "assinatura":
      return <Badge variant="secondary">Assinatura</Badge>;
    case "sem dados":
      return <Badge variant="outline">Sem Dados</Badge>;
    case "bloqueado":
      return <Badge variant="destructive">Bloqueado</Badge>;
    case "manutenção":
    case "manutencao":
      return <Badge variant="warning">Manutenção</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default AssetStatusBadge;
