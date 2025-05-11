
import React from "react";
import { ChipAsset, RouterAsset } from "@/types/asset";
import { AlertTriangle } from "lucide-react";

interface AssetDetailsProps {
  asset: ChipAsset | RouterAsset;
}

export const AssetDetails: React.FC<AssetDetailsProps> = ({ asset }) => {
  if (asset.type === "CHIP") {
    const chipAsset = asset as ChipAsset;
    return (
      <div>
        <div>{chipAsset.phoneNumber}</div>
        <div className="text-xs text-gray-500">
          {chipAsset.carrier}
        </div>
      </div>
    );
  } else {
    const routerAsset = asset as RouterAsset;
    return (
      <div>
        <div className="flex items-center gap-2">
          {routerAsset.brand} {routerAsset.model}
          {routerAsset.hasWeakPassword && (
            <div className="flex items-center text-orange-500 text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span className="ml-1">Senha fraca</span>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          SSID: {routerAsset.ssid}
        </div>
      </div>
    );
  }
};
