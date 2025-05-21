
import React from "react";
import { Wifi, Smartphone } from "lucide-react";
import { 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Asset } from "@/types/asset";

interface AssetDialogHeaderProps {
  asset: Asset;
}

const AssetDialogHeader = ({ asset }: AssetDialogHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        {asset.type === "CHIP" ? (
          <>
            <Smartphone className="h-5 w-5" />
            <span>Editar Chip</span>
          </>
        ) : (
          <>
            <Wifi className="h-5 w-5" />
            <span>Editar Roteador</span>
          </>
        )}
      </DialogTitle>
      <DialogDescription>
        Altere as informações do ativo conforme necessário.
      </DialogDescription>
    </DialogHeader>
  );
};

export default AssetDialogHeader;
