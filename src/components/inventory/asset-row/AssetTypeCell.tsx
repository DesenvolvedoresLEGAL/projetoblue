
import React from "react";
import { Smartphone, Wifi } from "lucide-react";
import { TableCell } from "@/components/ui/table";

interface AssetTypeCellProps {
  type: string;
}

const AssetTypeCell = ({ type }: AssetTypeCellProps) => {
  return (
    <TableCell onClick={(e) => e.stopPropagation()}>
      {type === "CHIP" ? (
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          <span>Chip</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          <span>Roteador</span>
        </div>
      )}
    </TableCell>
  );
};

export default AssetTypeCell;
