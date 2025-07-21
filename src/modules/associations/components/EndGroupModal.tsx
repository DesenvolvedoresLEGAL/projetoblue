
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
import { XCircle } from 'lucide-react';
import { ClientAssociationGroup } from '../types/associationsTypes';

interface EndGroupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  group: ClientAssociationGroup | null;
  onConfirm: (exitDate: string, notes?: string) => void;
  isLoading?: boolean;
}

const EndGroupModal: React.FC<EndGroupModalProps> = ({
  isOpen,
  onOpenChange,
  group,
  onConfirm,
  isLoading = false
}) => {
  const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const activeAssociations = group?.associations.filter(a => a.status) || [];

  const handleConfirm = () => {
    onConfirm(exitDate, notes.trim() || undefined);
    setNotes('');
  };

  const handleCancel = () => {
    onOpenChange(false);
    setNotes('');
  };

  if (!group) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Encerrar Grupo de Associações
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja encerrar todas as {activeAssociations.length} associações ativas 
            do cliente <strong>{group.client.nome}</strong>? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Resumo das associações ativas */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="text-sm font-medium">Associações que serão encerradas:</div>
            <div className="text-sm text-muted-foreground">
              {group.principalChips > 0 && (
                <div>• {group.principalChips} chips principais</div>
              )}
              {group.backupChips > 0 && (
                <div>• {group.backupChips} chips backup</div>
              )}
              {group.equipmentOnly > 0 && (
                <div>• {group.equipmentOnly} equipamentos</div>
              )}
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
              placeholder="Motivo do encerramento do grupo ou observações..."
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
              disabled={isLoading || activeAssociations.length === 0}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? 'Encerrando...' : `Encerrar ${activeAssociations.length} Associações`}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EndGroupModal;
