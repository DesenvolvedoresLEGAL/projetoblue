
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { Association } from '@/types/associations';
import { toast } from 'sonner';
import { showFriendlyError } from '@/utils/errorTranslator';

interface EditAssociationDialogProps {
  association: Association | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditAssociationDialog: React.FC<EditAssociationDialogProps> = ({
  association,
  open,
  onOpenChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    entry_date: '',
    exit_date: '',
    notes: '',
    ssid: '',
    pass: '',
    gb: 0
  });

  useEffect(() => {
    if (association) {
      setFormData({
        entry_date: association.entry_date || '',
        exit_date: association.exit_date || '',
        notes: association.notes || '',
        ssid: association.ssid || '',
        pass: association.pass || '',
        gb: association.gb || 0
      });
    }
  }, [association]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!association) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('associations')
        .update({
          entry_date: formData.entry_date,
          exit_date: formData.exit_date || null,
          notes: formData.notes,
          ssid: formData.ssid,
          pass: formData.pass,
          gb: formData.gb,
          updated_at: new Date().toISOString()
        })
        .eq('id', association.id);

      if (error) {
        if (import.meta.env.DEV) console.error('Erro ao atualizar associação:', error);
        const friendlyMessage = showFriendlyError(error, 'update');
        throw new Error(friendlyMessage);
      }

      toast.success('Associação atualizada com sucesso!');
      onOpenChange(false);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erro ao atualizar associação:', error);
      const friendlyMessage = showFriendlyError(error, 'update');
      toast.error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Associação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entry_date">Data de Entrada</Label>
              <Input
                id="entry_date"
                type="date"
                value={formData.entry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, entry_date: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="exit_date">Data de Saída</Label>
              <Input
                id="exit_date"
                type="date"
                value={formData.exit_date}
                onChange={(e) => setFormData(prev => ({ ...prev, exit_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="ssid">SSID</Label>
            <Input
              id="ssid"
              value={formData.ssid}
              onChange={(e) => setFormData(prev => ({ ...prev, ssid: e.target.value }))}
              placeholder="Nome da rede WiFi"
            />
          </div>

          <div>
            <Label htmlFor="pass">Senha</Label>
            <Input
              id="pass"
              type="password"
              value={formData.pass}
              onChange={(e) => setFormData(prev => ({ ...prev, pass: e.target.value }))}
              placeholder="Senha da rede WiFi"
            />
          </div>

          <div>
            <Label htmlFor="gb">GB do Plano</Label>
            <Input
              id="gb"
              type="number"
              value={formData.gb}
              onChange={(e) => setFormData(prev => ({ ...prev, gb: Number(e.target.value) }))}
              placeholder="Quantidade em GB"
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
