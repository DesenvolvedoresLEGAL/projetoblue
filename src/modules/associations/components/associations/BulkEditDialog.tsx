
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssociationGroup } from '@/types/associations';
import { useGroupActions } from '../../hooks/useGroupActions';

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AssociationGroup;
}

export const BulkEditDialog: React.FC<BulkEditDialogProps> = ({
  open,
  onOpenChange,
  group
}) => {
  const [notes, setNotes] = useState('');
  const [exitDate, setExitDate] = useState<Date | undefined>();
  const [associationType, setAssociationType] = useState<string>('');
  const { bulkUpdateGroup } = useGroupActions();

  interface BulkUpdates {
    notes?: string;
    exit_date?: string;
    association_id?: number;
  }

  const handleSave = () => {
    const updates: BulkUpdates = {};

    if (notes.trim()) {
      updates.notes = notes.trim();
    }

    if (exitDate) {
      updates.exit_date = exitDate.toISOString().split('T')[0];
    }

    if (associationType) {
      updates.association_id = parseInt(associationType);
    }

    if (Object.keys(updates).length > 0) {
      bulkUpdateGroup.mutate({ group, updates });
      onOpenChange(false);
      // Reset form
      setNotes('');
      setExitDate(undefined);
      setAssociationType('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Grupo em Lote</DialogTitle>
          <DialogDescription>
            Editando {group.totalAssets} associação{group.totalAssets > 1 ? 'ões' : ''} do cliente {group.client_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de Associação */}
          <div className="space-y-2">
            <Label>Tipo de Associação</Label>
            <Select value={associationType} onValueChange={setAssociationType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar novo tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Aluguel</SelectItem>
                <SelectItem value="2">Assinatura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data de Fim */}
          <div className="space-y-2">
            <Label>Data de Fim</Label>
            <DatePicker
              date={exitDate}
              setDate={setExitDate}
              placeholder="Definir data de fim para todas"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações que serão aplicadas a todas as associações..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!notes.trim() && !exitDate && !associationType}
          >
            Aplicar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
