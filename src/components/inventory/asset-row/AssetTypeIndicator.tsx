
import React from "react";
import { Smartphone, Wifi } from "lucide-react";

interface AssetTypeIndicatorProps {
  type: "CHIP" | "ROTEADOR";
}

export const AssetTypeIndicator: React.FC<AssetTypeIndicatorProps> = ({ type }) => {
  return type === "CHIP" ? (
    <div className="flex items-center gap-2">
      <Smartphone className="h-4 w-4" />
      <span>Chip</span>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Wifi className="h-4 w-4" />
      <span>Roteador</span>
    </div>
  );
};
