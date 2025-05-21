
import React from "react";
import { TableCell } from "@/components/ui/table";
import { Asset, ChipAsset, RouterAsset } from "@/types/asset";

interface AssetIdentifierCellProps {
  asset: Asset;
}

const AssetIdentifierCell = ({ asset }: AssetIdentifierCellProps) => {
  return (
    <TableCell className="font-medium">
      {asset.type === "CHIP"
        ? (asset as ChipAsset).iccid
        : (asset as RouterAsset).uniqueId
      }
    </TableCell>
  );
};

export default AssetIdentifierCell;
