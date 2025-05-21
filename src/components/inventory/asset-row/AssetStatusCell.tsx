
import React from "react";
import { AssetStatus } from "@/types/asset";
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AssetStatusCellProps {
  status: AssetStatus;
}

const AssetStatusCell = ({ status }: AssetStatusCellProps) => {
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
    <TableCell onClick={(e) => e.stopPropagation()}>
      <Badge className={getStatusBadgeStyle(status)}>
        {status}
      </Badge>
    </TableCell>
  );
};

export default AssetStatusCell;
