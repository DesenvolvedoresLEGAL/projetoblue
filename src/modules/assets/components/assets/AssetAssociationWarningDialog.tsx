
import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AssetWithRelations } from '@modules/assets/hooks/useAssetsData';
import { AssetAssociation } from '@modules/assets/services/asset/associationQueries';

interface AssetAssociationWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetWithRelations | null;
  associations: AssetAssociation[];
}

const AssetAssociationWarningDialog = ({ 
  isOpen, 
  onClose, 
  asset, 
  associations 
}: AssetAssociationWarningDialogProps) => {
  if (!asset || !associations.length) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getAssociationTypeLabel = (associationId: number) => {
    switch (associationId) {
      case 1: return 'Aluguel';
      case 2: return 'Assinatura';
      default: return 'Outros';
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Não é possível excluir este ativo</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Este ativo possui associações ativas e não pode ser excluído. 
                Para excluir este ativo, você deve primeiro desfazer as associações abaixo:
              </p>
              
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <h4 className="font-medium text-sm">Informações do Ativo:</h4>
                <p className="text-sm">
                  <strong>Tipo:</strong> {asset.solucao?.name || 'N/A'}
                </p>
                {asset.solucao?.id === 11 ? (
                  <p className="text-sm">
                    <strong>ICCID:</strong> ...{asset.iccid?.substring(asset.iccid.length - 5) || 'N/A'}
                  </p>
                ) : (
                  <p className="text-sm">
                    <strong>Número de Série:</strong> {asset.serial_number || 'N/A'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Associações Ativas:</h4>
                {associations.map((assoc, index) => (
                  <div key={assoc.id} className="bg-red-50 p-3 rounded-md text-sm">
                    <p><strong>Cliente:</strong> {assoc.client_name}</p>
                    <p><strong>Tipo:</strong> {getAssociationTypeLabel(assoc.association_id)}</p>
                    <p><strong>Data de Início:</strong> {formatDate(assoc.entry_date)}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm font-medium">
                Vá para a página de Associações para desfazer essas associações antes de tentar excluir o ativo.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onClose} variant="outline">
            Entendi
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AssetAssociationWarningDialog;
