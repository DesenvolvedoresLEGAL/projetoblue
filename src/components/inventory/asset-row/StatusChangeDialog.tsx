
import React from "react";
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
import { AssetStatus } from "@/types/asset";

interface StatusDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  selectedStatus: { id: number; name: string; status: AssetStatus } | null;
}

export const StatusChangeDialog: React.FC<StatusDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  selectedStatus,
}) => {
  if (!selectedStatus) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar mudança de status</AlertDialogTitle>
          <AlertDialogDescription>
            {selectedStatus.status === "BLOQUEADO" ? (
              <div className="flex flex-col gap-2">
                <p>Tem certeza que deseja marcar este ativo como <strong className="text-red-500">Bloqueado</strong>?</p>
                <p className="text-amber-500 font-semibold">Atenção: Este status indica um problema sério com o ativo.</p>
              </div>
            ) : (
              <p>Tem certeza que deseja alterar o status deste ativo para <strong>{selectedStatus.name}</strong>?</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
