
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
import { assetService } from '@modules/assets/services/asset';
import { toast } from '@/utils/toast';
import { AssetWithRelations } from '@/types/assetWithRelations';
import { AssetAssociation } from '@modules/assets/services/asset/associationQueries';
import AssetAssociationWarningDialog from './AssetAssociationWarningDialog';
import { showFriendlyError } from '@/utils/errorTranslator';

interface DeleteAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetWithRelations | null;
  onAssetDeleted: () => void;
}

const DeleteAssetDialog = ({ isOpen, onClose, asset, onAssetDeleted }: DeleteAssetDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingAssociation, setIsCheckingAssociation] = useState(false);
  const [associationData, setAssociationData] = useState<AssetAssociation[]>([]);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleDelete = async () => {
    if (!asset) return;
    
    setIsCheckingAssociation(true);
    
    try {
      
      
      const activeAssociations = await assetService.checkActiveAssociations(asset.uuid);
      
      if (activeAssociations.length > 0) {
        
        setAssociationData(activeAssociations);
        setShowWarningModal(true);
        setIsCheckingAssociation(false);
        return;
      }
      
      
      setIsCheckingAssociation(false);
      setIsDeleting(true);
      
      const success = await assetService.deleteAsset(asset.uuid);
      
      if (success) {
        toast.success("Ativo excluído com sucesso");
        onAssetDeleted();
        onClose();
      } else {
        toast.error("Não foi possível excluir o ativo. Tente novamente ou entre em contato com o suporte.");
      }
    } catch (error) {
      
      const friendlyMessage = showFriendlyError(error, 'delete');
      toast.error(friendlyMessage);
    } finally {
      setIsDeleting(false);
      setIsCheckingAssociation(false);
    }
  };

  const handleCloseWarning = () => {
    setShowWarningModal(false);
    setAssociationData([]);
    onClose(); // Also close the main delete dialog
  };

  const isLoading = isDeleting || isCheckingAssociation;

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {isCheckingAssociation 
                ? "Verificando associações do ativo..."
                : "Tem certeza que deseja excluir este ativo? Esta ação não pode ser desfeita."
              }
              {asset && asset.solucao && !isCheckingAssociation && (
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
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isLoading}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isCheckingAssociation 
                ? "Verificando..." 
                : isDeleting 
                  ? "Excluindo..." 
                  : "Excluir"
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AssetAssociationWarningDialog
        isOpen={showWarningModal}
        onClose={handleCloseWarning}
        asset={asset}
        associations={associationData}
      />
    </>
  );
};

export default DeleteAssetDialog;
