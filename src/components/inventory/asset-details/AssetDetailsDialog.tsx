
import { Asset } from "@/types/asset";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAssets } from "@/context/useAssets";
import { AssetHeader } from "./AssetHeader";
import { AssetDetailsTab } from "./AssetDetailsTab";
import { AssetHistoryTab } from "./AssetHistoryTab";

interface AssetDetailsDialogProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssetDetailsDialog({ 
  asset, 
  isOpen, 
  onClose 
}: AssetDetailsDialogProps) {
  const { getClientById, getAssetHistory } = useAssets();
  
  if (!asset) return null;
  
  const client = asset.clientId ? getClientById(asset.clientId) : null;
  const assetHistory = getAssetHistory(asset.id).slice(0, 5);  // Get last 5 entries
  const isChip = asset.type === "CHIP";
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <AssetHeader 
            isChip={isChip} 
            asset={asset} 
          />
        </DialogHeader>
        
        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4 space-y-6">
            <AssetDetailsTab 
              asset={asset} 
              client={client} 
            />
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <AssetHistoryTab assetHistory={assetHistory} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default AssetDetailsDialog;
