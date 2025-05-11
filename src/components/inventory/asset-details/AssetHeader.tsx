
import { Asset, ChipAsset, RouterAsset } from "@/types/asset";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Smartphone, Wifi } from "lucide-react";

interface AssetHeaderProps {
  isChip: boolean;
  asset: Asset;
}

export function AssetHeader({ isChip, asset }: AssetHeaderProps) {
  const chip = isChip ? asset as ChipAsset : null;
  const router = !isChip ? asset as RouterAsset : null;
  
  return (
    <>
      <DialogTitle className="flex items-center gap-2">
        {isChip ? (
          <>
            <Smartphone className="h-5 w-5" />
            Detalhes do Chip
          </>
        ) : (
          <>
            <Wifi className="h-5 w-5" />
            Detalhes do Roteador
          </>
        )}
      </DialogTitle>
      <DialogDescription>
        {isChip 
          ? `ICCID: ${chip?.iccid}` 
          : `ID: ${router?.uniqueId}`
        }
      </DialogDescription>
    </>
  );
}
