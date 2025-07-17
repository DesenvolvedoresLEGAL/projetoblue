
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AssociationWithRelations } from '../types/associationsTypes';
import { getEquipmentInfo, getChipInfo, getAssociationPeriod } from '../utils/associationFormatters';

interface EndAssociationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  association: AssociationWithRelations | null;
  onConfirm: (exitDate: string, notes?: string) => void;
  isLoading?: boolean;
}

const EndAssociationModal: React.FC<EndAssociationModalProps> = ({
  isOpen,
  onOpenChange,
  association,
  onConfirm,
  isLoading = false
}) => {
  const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(exitDate, notes.trim() || undefined);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setNotes('');
  };

  if (!association) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            Finalizar Associação
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja finalizar esta associação? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Informações da Associação */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Cliente:</span>
                <div className="font-medium">{association.client.nome}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Período:</span>
                <div className="font-medium">{getAssociationPeriod(association)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Equipamento:</span>
                <div className="font-medium">{getEquipmentInfo(association)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Chip:</span>
                <div className="font-medium">{getChipInfo(association)}</div>
              </div>
            </div>
          </div>

          {/* Data de Finalização */}
          <div className="space-y-2">
            <Label htmlFor="exit-date">Data de Finalização</Label>
            <Input
              id="exit-date"
              type="date"
              value={exitDate}
              onChange={(e) => setExitDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Motivo da finalização ou observações..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? 'Finalizando...' : 'Finalizar Associação'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EndAssociationModal;
