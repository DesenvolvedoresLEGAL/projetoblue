
import React from "react";
import { Asset } from "@/types/asset";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExtendSubscriptionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  asset: Asset | null;
  newEndDate: string;
  setNewEndDate: (date: string) => void;
  handleExtendSubscription: () => void;
  getClientById: (id: string) => any;
}

export const ExtendSubscriptionDialog: React.FC<ExtendSubscriptionDialogProps> = ({
  open,
  setOpen,
  asset,
  newEndDate,
  setNewEndDate,
  handleExtendSubscription,
  getClientById,
}) => {
  if (!asset || !asset.subscription) return null;

  // Format date display
  const formatDateDisplay = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renovar Assinatura</DialogTitle>
          <DialogDescription>
            Defina uma nova data de término para estender esta assinatura.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Ativo</h4>
              <p className="text-sm">
                {asset.type === "CHIP" 
                  ? `CHIP: ${(asset as any).phoneNumber}` 
                  : `ROTEADOR: ${(asset as any).model}`
                }
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Cliente</h4>
              <p className="text-sm">
                {asset.clientId 
                  ? getClientById(asset.clientId)?.name 
                  : "—"
                }
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Tipo de Assinatura</h4>
              <p className="text-sm">{asset.subscription.type}</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Data Atual de Término</h4>
              <p className="text-sm">{formatDateDisplay(asset.subscription.endDate)}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Nova Data de Término</h4>
            <Input
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd")}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExtendSubscription}>
            <RefreshCw className="h-4 w-4 mr-2" /> Confirmar Renovação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
