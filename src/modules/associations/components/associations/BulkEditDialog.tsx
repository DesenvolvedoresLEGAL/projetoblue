
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Association } from '@/types/associations';

interface BulkUpdates extends Record<string, unknown> {
  exit_date?: Date;
  notes?: string;
  ssid?: string;
  pass?: string;
  gb?: number;
}

interface BulkEditDialogProps {
  open: boolean;
  onClose: () => void;
  selectedAssociations: Association[];
  onBulkUpdate: (updates: BulkUpdates) => Promise<void>;
  isLoading?: boolean;
}

export const BulkEditDialog: React.FC<BulkEditDialogProps> = ({
  open,
  onClose,
  selectedAssociations,
  onBulkUpdate,
  isLoading = false
}) => {
  const [updates, setUpdates] = useState<BulkUpdates>({});

  const handleDateSelect = (date: Date | undefined) => {
    setUpdates(prev => ({
      ...prev,
      exit_date: date
    }));
  };

  const handleInputChange = (field: keyof BulkUpdates, value: unknown) => {
    setUpdates(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await onBulkUpdate(updates);
      setUpdates({});
      onClose();
    } catch (error) {
      console.error('Erro na atualização em lote:', error);
    }
  };

  const hasUpdates = Object.keys(updates).length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Editar {selectedAssociations.length} Associações
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Exit Date */}
          <div className="space-y-2">
            <Label>Data de Saída</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {updates.exit_date ? format(updates.exit_date, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={updates.exit_date}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Adicionar observações..."
              value={updates.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>

          {/* SSID */}
          <div className="space-y-2">
            <Label>SSID</Label>
            <Input
              placeholder="Nome da rede Wi-Fi..."
              value={updates.ssid || ''}
              onChange={(e) => handleInputChange('ssid', e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label>Senha</Label>
            <Input
              type="password"
              placeholder="Senha da rede..."
              value={updates.pass || ''}
              onChange={(e) => handleInputChange('pass', e.target.value)}
            />
          </div>

          {/* GB */}
          <div className="space-y-2">
            <Label>GB</Label>
            <Input
              type="number"
              placeholder="Quantidade em GB..."
              value={updates.gb || ''}
              onChange={(e) => handleInputChange('gb', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!hasUpdates || isLoading}
          >
            {isLoading ? 'Atualizando...' : 'Aplicar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
