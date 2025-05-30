
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { AlertTriangle, Wifi, Lock } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Association {
  id: number;
  asset_id: string;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  association_id: number;
  created_at: string;
  client_name: string;
  asset_iccid: string | null;
  asset_radio: string | null;
  asset_solution_id: number;
  asset_solution_name: string;
  notes?: string;
  ssid?: string;
  pass?: string;
}

interface EditAssociationDialogProps {
  association: Association | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAssociationDialog({ association, open, onOpenChange }: EditAssociationDialogProps) {
  const [entryDate, setEntryDate] = useState<Date | undefined>();
  const [exitDate, setExitDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');
  const [ssid, setSsid] = useState('');
  const [networkPassword, setNetworkPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Verificar se é equipamento (não CHIP)
  const isEquipment = association && 
    association.asset_solution_name?.toUpperCase() !== 'CHIP' && 
    association.asset_solution_id !== 11;

  // Preencher formulário quando associação muda
  useEffect(() => {
    if (association) {
      // Converter datas corretamente
      if (association.entry_date) {
        const [year, month, day] = association.entry_date.split('-').map(Number);
        setEntryDate(new Date(year, month - 1, day));
      }
      
      if (association.exit_date) {
        const [year, month, day] = association.exit_date.split('-').map(Number);
        setExitDate(new Date(year, month - 1, day));
      } else {
        setExitDate(undefined);
      }
      
      setNotes(association.notes || '');
      setSsid(association.ssid || '');
      setNetworkPassword(association.pass || '');
      setValidationError(null);
    }
  }, [association]);

  // Validação de datas
  useEffect(() => {
    let error = null;

    if (entryDate && exitDate && exitDate < entryDate) {
      error = 'A data de fim não pode ser anterior à data de início';
    }

    setValidationError(error);
  }, [entryDate, exitDate]);

  const updateMutation = useMutation({
    mutationFn: async (updateData: { 
      entry_date: string; 
      exit_date?: string | null; 
      notes?: string;
      ssid?: string;
      pass?: string;
    }) => {
      const { error } = await supabase
        .from('asset_client_assoc')
        .update(updateData)
        .eq('id', association!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidar queries para atualizar a tabela
      queryClient.invalidateQueries({ queryKey: ['associations-list'] });
      toast.success('Associação atualizada com sucesso!');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Erro ao atualizar associação:', error);
      toast.error('Erro ao atualizar associação. Tente novamente.');
    }
  });

  const handleSave = () => {
    if (!entryDate) {
      setValidationError('Data de início é obrigatória');
      return;
    }

    if (validationError) {
      return;
    }

    const updateData: any = {
      entry_date: entryDate.toISOString().split('T')[0],
      exit_date: exitDate ? exitDate.toISOString().split('T')[0] : null,
      notes: notes.trim() || null
    };

    // Adicionar SSID e senha apenas para equipamentos
    if (isEquipment) {
      updateData.ssid = ssid.trim() || null;
      updateData.pass = networkPassword.trim() || null;
    }

    updateMutation.mutate(updateData);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setValidationError(null);
  };

  if (!association) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Associação</DialogTitle>
          <DialogDescription>
            Edite os dados da associação #{association.id}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Informações da Associação */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Cliente</Label>
              <div className="font-medium">{association.client_name}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Ativo</Label>
              <div className="font-medium">
                {association.asset_solution_id === 11 && association.asset_iccid 
                  ? association.asset_iccid 
                  : association.asset_radio || 'N/A'}
              </div>
            </div>
          </div>

          {/* Mensagem de erro de validação */}
          {validationError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{validationError}</span>
            </div>
          )}

          {/* Data de Início */}
          <div className="space-y-2">
            <Label htmlFor="entry-date">Data de Início *</Label>
            <DatePicker
              date={entryDate}
              setDate={setEntryDate}
              placeholder="Selecionar data de início"
            />
          </div>

          {/* Data de Fim */}
          <div className="space-y-2">
            <Label htmlFor="exit-date">Data de Fim</Label>
            <DatePicker
              date={exitDate}
              setDate={setExitDate}
              placeholder="Selecionar data de fim (opcional)"
            />
          </div>

          {/* Campos SSID e Senha (apenas para equipamentos) */}
          {isEquipment && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ssid" className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  SSID da Rede
                </Label>
                <Input
                  id="ssid"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="#WiFi.LEGAL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="network-password" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Senha da Rede
                </Label>
                <Input
                  id="network-password"
                  type="password"
                  value={networkPassword}
                  onChange={(e) => setNetworkPassword(e.target.value)}
                  placeholder="123legal"
                />
              </div>
            </div>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas/Observações</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre esta associação..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending || !!validationError || !entryDate}
          >
            {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
