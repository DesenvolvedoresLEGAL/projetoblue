
import React, { useState } from "react";
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
import { Asset, AssetStatus } from "@/types/asset";
import { toast } from "@/utils/toast";

interface StatusChangeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
  selectedStatus: { id: number; name: string; status: AssetStatus } | null;
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>;
}

const StatusChangeDialog = ({
  isOpen,
  onOpenChange,
  asset,
  selectedStatus,
  updateAsset,
}: StatusChangeDialogProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusConfirm = async () => {
    if (!selectedStatus) return;
    
    setIsUpdating(true);
    
    try {
      const updatedAsset = await updateAsset(asset.id, { 
        status: selectedStatus.status, 
        statusId: selectedStatus.id 
      });
      
      if (updatedAsset) {
        toast.success(`O ativo agora está marcado como ${selectedStatus.name}.`);
      } else {
        toast.error("Não foi possível atualizar o status do ativo.");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Ocorreu um erro ao atualizar o status do ativo.");
    } finally {
      setIsUpdating(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar mudança de status</AlertDialogTitle>
          <AlertDialogDescription>
            {selectedStatus?.status === "BLOQUEADO" ? (
              <div className="flex flex-col gap-2">
                <p>Tem certeza que deseja marcar este ativo como <strong className="text-red-500">Bloqueado</strong>?</p>
                <p className="text-amber-500 font-semibold">Atenção: Este status indica um problema sério com o ativo.</p>
              </div>
            ) : (
              <p>Tem certeza que deseja alterar o status deste ativo para <strong>{selectedStatus?.name}</strong>?</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleStatusConfirm} 
            disabled={isUpdating}
          >
            {isUpdating ? "Atualizando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default StatusChangeDialog;
