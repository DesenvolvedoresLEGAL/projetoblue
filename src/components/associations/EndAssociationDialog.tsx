
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Association {
  id: number;
  asset_id: string;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  association_id: number;
  plan_id: number;
  notes: string | null;
  gb: number;
  ssid: string | null;
  created_at: string;
  updated_at: string;
  asset: {
    uuid: string;
    iccid: string | null;
    radio: string | null;
    serial_number: string | null;
    model: string | null;
    line_number: number | null;
    solution: string;
    manufacturer: string;
    status: string;
  };
  client: {
    uuid: string;
    nome: string;
    cnpj: string;
    email: string | null;
    contato: number;
  };
  plan: {
    nome: string;
  };
  association_type: {
    type: string;
  };
}

interface EndAssociationDialogProps {
  association: Association;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssociationEnded: () => void;
}

export const EndAssociationDialog: React.FC<EndAssociationDialogProps> = ({
  association,
  open,
  onOpenChange,
  onAssociationEnded,
}) => {
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getAssetIdentifier = (asset: Association['asset']) => {
    if (asset.solution === 'CHIP' && asset.iccid) {
      return `CHIP - ICCID: ${asset.iccid.substring(asset.iccid.length - 8)}`;
    }
    if (asset.radio) {
      return `${asset.solution} - Rádio: ${asset.radio}`;
    }
    if (asset.serial_number) {
      return `${asset.solution} - SN: ${asset.serial_number}`;
    }
    return `${asset.solution} - ${asset.uuid.substring(0, 8)}`;
  };

  const handleEndAssociation = async () => {
    if (!endDate) {
      toast.error('Por favor, informe a data de encerramento');
      return;
    }

    setIsLoading(true);
    try {
      // Buscar status "Disponível" - geralmente é o ID 1
      const { data: statusData, error: statusError } = await supabase
        .from('asset_status')
        .select('id')
        .ilike('status', 'disponível')
        .single();

      if (statusError) {
        console.error('Error finding available status:', statusError);
        toast.error('Erro ao buscar status "Disponível"');
        return;
      }

      const availableStatusId = statusData.id;

      // Atualizar a associação com data de fim
      const { error: associationError } = await supabase
        .from('asset_client_assoc')
        .update({
          exit_date: endDate,
          notes: notes ? `${association.notes || ''}\n[${new Date().toLocaleDateString()}] Encerramento: ${notes}`.trim() : association.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', association.id);

      if (associationError) {
        console.error('Error updating association:', associationError);
        toast.error('Erro ao encerrar associação');
        return;
      }

      // Atualizar status do ativo para "Disponível"
      const { error: assetError } = await supabase
        .from('assets')
        .update({
          status_id: availableStatusId,
          updated_at: new Date().toISOString()
        })
        .eq('uuid', association.asset_id);

      if (assetError) {
        console.error('Error updating asset status:', assetError);
        // Não falhamos aqui pois a associação já foi encerrada
        toast.warning('Associação encerrada, mas houve erro ao atualizar status do ativo');
      }

      // Inserir log de auditoria
      const { error: logError } = await supabase
        .from('asset_logs')
        .insert({
          assoc_id: association.id,
          date: new Date().toISOString(),
          event: 'ASSOCIATION_ENDED',
          details: {
            user_id: (await supabase.auth.getUser()).data.user?.id || null,
            username: (await supabase.auth.getUser()).data.user?.email || 'system',
            association_id: association.id,
            client_name: association.client.nome,
            asset_solution: association.asset.solution,
            end_date: endDate,
            end_notes: notes,
            event_description: 'Associação encerrada manualmente'
          },
          status_before_id: null, // Status do ativo antes (se necessário)
          status_after_id: availableStatusId
        });

      if (logError) {
        console.error('Error creating audit log:', logError);
        // Não falhamos aqui pois a operação principal foi bem-sucedida
      }

      onAssociationEnded();
    } catch (error) {
      console.error('Unexpected error ending association:', error);
      toast.error('Erro inesperado ao encerrar associação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Encerrar Associação</DialogTitle>
          <DialogDescription>
            Confirme o encerramento da associação abaixo. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações da Associação */}
          <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
            <div>
              <strong>Cliente:</strong> {association.client.nome}
            </div>
            <div>
              <strong>Ativo:</strong> {getAssetIdentifier(association.asset)}
            </div>
            <div>
              <strong>Tipo:</strong> {association.association_type.type}
            </div>
            <div>
              <strong>Plano:</strong> {association.plan.nome}
            </div>
          </div>

          {/* Data de Encerramento */}
          <div className="space-y-2">
            <Label htmlFor="end-date">Data de Encerramento *</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações sobre o Encerramento</Label>
            <Textarea
              id="notes"
              placeholder="Motivo do encerramento, condições do equipamento, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleEndAssociation}
            disabled={isLoading}
          >
            {isLoading ? 'Encerrando...' : 'Encerrar Associação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
