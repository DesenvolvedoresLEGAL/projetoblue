
import React from "react";
import { TableCell } from "@/components/ui/table";

interface AssetDateCellProps {
  date: string;
}

const AssetDateCell = ({ date }: AssetDateCellProps) => {
  return (
    <TableCell>
      {new Date(date).toLocaleDateString("pt-BR")}
    </TableCell>
  );
};

export default AssetDateCell;
