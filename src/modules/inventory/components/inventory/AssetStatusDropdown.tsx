
import React, { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAssets } from "@/context/useAssets";
import { StatusRecord, Asset } from "@/types/asset";
import { toast } from "@/utils/toast";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { showFriendlyError } from '@/utils/errorTranslator';

interface AssetStatusDropdownProps {
  asset: Asset;
  statusRecords: StatusRecord[];
}

const AssetStatusDropdown = ({ asset, statusRecords }: AssetStatusDropdownProps) => {
  const { updateAsset } = useAssets();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{id: number, status: string} | null>(null);
  
  const handleStatusSelect = (statusId: number, statusName: string) => {
    if (asset.statusId === statusId) return;
    
    setSelectedStatus({ id: statusId, status: statusName });
    setConfirmDialogOpen(true);
  };
  
  const handleConfirmStatusChange = async () => {
    if (!selectedStatus) return;
    
    setIsLoading(true);
    try {
      await updateAsset(asset.id, { 
        status: selectedStatus.status as any, 
        statusId: selectedStatus.id 
      });
      toast.success(`Status alterado para ${selectedStatus.status} com sucesso`);
    } catch (error) {
      const friendlyMessage = showFriendlyError(error, 'update');
      toast.error(friendlyMessage);
      console.error("Error updating asset status:", error);
    } finally {
      setIsLoading(false);
      setConfirmDialogOpen(false);
      setSelectedStatus(null);
    }
  };

  const isCurrentStatus = (statusId: number) => asset.statusId === statusId;
  const currentStatus = statusRecords.find(s => s.id === asset.statusId);
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full justify-between"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>
                  {currentStatus?.status || "Atualizar Status"}
                </span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white">
          {statusRecords.map((status) => (
            <DropdownMenuItem
              key={status.id}
              onClick={() => handleStatusSelect(status.id, status.status)}
              className={`flex justify-between ${isCurrentStatus(status.id) ? 'bg-muted' : ''}`}
            >
              {status.status}
              {isCurrentStatus(status.id) && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração de status</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja alterar o status do ativo para "{selectedStatus?.status}"?
              {(selectedStatus?.status === "Bloqueado" || selectedStatus?.status === "BLOQUEADO") && (
                <p className="mt-2 text-red-500 font-semibold">
                  Atenção: Bloquear um ativo pode afetar os serviços relacionados.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmStatusChange}
              disabled={isLoading}
              className={selectedStatus?.status === "Bloqueado" || selectedStatus?.status === "BLOQUEADO" ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AssetStatusDropdown;
