
import React from "react";
import { AlertTriangle } from "lucide-react";
import { TableCell } from "@/components/ui/table";
import { Asset, ChipAsset, RouterAsset } from "@/types/asset";

interface AssetDetailsCellProps {
  asset: Asset;
}

const AssetDetailsCell = ({ asset }: AssetDetailsCellProps) => {
  return (
    <TableCell>
      {asset.type === "CHIP" ? (
        <div>
          <div>{(asset as ChipAsset).phoneNumber}</div>
          <div className="text-xs text-gray-500">
            {(asset as ChipAsset).carrier}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2">
            {(asset as RouterAsset).brand} {(asset as RouterAsset).model}
            {(asset as RouterAsset).hasWeakPassword && (
              <div className="flex items-center text-orange-500 text-xs">
                <AlertTriangle className="h-4 w-4" />
                <span className="ml-1">Senha fraca</span>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            SSID: {(asset as RouterAsset).ssid}
          </div>
        </div>
      )}
    </TableCell>
  );
};

export default AssetDetailsCell;
