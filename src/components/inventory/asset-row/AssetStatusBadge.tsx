
import React from "react";
import { AssetStatus } from "@/types/asset";
import { Badge } from "@/components/ui/badge";

interface AssetStatusBadgeProps {
  status: AssetStatus;
}

export const AssetStatusBadge: React.FC<AssetStatusBadgeProps> = ({ status }) => {
  const getStatusBadgeStyle = (status: AssetStatus) => {
    switch (status) {
      case "DISPONÍVEL":
        return "bg-green-500";
      case "ALUGADO":
      case "ASSINATURA":
        return "bg-telecom-500";
      case "SEM DADOS":
        return "bg-amber-500";
      case "BLOQUEADO":
        return "bg-red-500";
      case "MANUTENÇÃO":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Badge className={getStatusBadgeStyle(status)}>
      {status}
    </Badge>
  );
};
