
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { isSameStatus } from '@/utils/assetUtils';

type AssetStatusBadgeProps = {
  status: string | undefined;
}

export const AssetStatusBadge = ({ status }: AssetStatusBadgeProps) => {
  // Handle undefined or null status
  if (!status) {
    return <Badge variant="outline">Desconhecido</Badge>;
  }
  
  // Now we can safely compare strings using our helper function
  if (isSameStatus(status, "DISPONÍVEL")) {
    return <Badge>Disponível</Badge>;
  }
  
  if (isSameStatus(status, "EM LOCAÇÃO")) {
    return <Badge variant="warning">Em locação</Badge>;
  }
  
  if (isSameStatus(status, "EM ASSINATURA")) {
    return <Badge variant='warning'>Em assinatura</Badge>;
  }
  
  if (isSameStatus(status, "SEM DADOS")) {
    return <Badge variant="outline">Sem Dados</Badge>;
  }
  
  if (isSameStatus(status, "BLOQUEADO")) {
    return <Badge variant="destructive">Bloqueado</Badge>;
  }
  
  if (isSameStatus(status, "EM MANUTENÇÃO")) {
    return <Badge variant="destructive">Em manutenção</Badge>;
  }
  
  return <Badge variant="secondary">{status}</Badge>;
};

export default AssetStatusBadge;
