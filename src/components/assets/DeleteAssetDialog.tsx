
import React, { useState } from 'react';
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
import assetService from '@/services/api/asset';
import { toast } from '@/utils/toast';
import { AssetWithRelations } from '@/hooks/useAssetsData';

interface DeleteAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetWithRelations | null;
  onAssetDeleted: () => void;
}

const DeleteAssetDialog = ({ isOpen, onClose, asset, onAssetDeleted }: DeleteAssetDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!asset) return;
    
    setIsDeleting(true);
    
    try {
      const success = await assetService.deleteAsset(asset.uuid);
      
      if (success) {
        toast.success("Ativo excluído com sucesso");
        onAssetDeleted();
        onClose();
      } else {
        toast.error("Falha ao excluir ativo");
      }
    } catch (error) {
      console.error('Erro ao excluir ativo:', error);
      toast.error("Ocorreu um erro ao processar a solicitação");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este ativo? Esta ação não pode ser desfeita.
            {asset && asset.solucao && (
              <div className="mt-2 font-medium">
                <p>Tipo: {asset.solucao.name}</p>
                <p>ID: {asset.uuid.substring(0, 8)}</p>
                {asset.solucao.id === 11 ? (
                  <p>ICCID: {asset.iccid?.substring(asset.iccid.length - 5) || 'N/A'}</p>
                ) : (
                  <p>Número de Série: {asset.serial_number || 'N/A'}</p>
                )}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAssetDialog;
