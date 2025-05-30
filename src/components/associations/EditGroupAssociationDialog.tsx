
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, Loader2, Users, Info, Wifi, Lock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDateForSubmission, validateDateRange } from '@/utils/dateUtils';

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
  asset_line_number: number | null;
  asset_solution_id: number;
  asset_solution_name: string;
}

interface EditGroupAssociationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  associations: Association[];
  onSuccess: () => void;
}

export const EditGroupAssociationDialog: React.FC<EditGroupAssociationDialogProps> = ({
  open,
  onOpenChange,
  associations,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newEntryDate, setNewEntryDate] = useState<Date | undefined>();
  const [newExitDate, setNewExitDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');
  const [ssid, setSsid] = useState('');
  const [networkPassword, setNetworkPassword] = useState('');

  // Pegar dados do primeiro item para mostrar informações do grupo
  const firstAssociation = associations[0];
  const clientName = firstAssociation?.client_name || 'Cliente';
  const totalAssets = associations.length;

  // Verificar se há equipamentos no grupo (para mostrar campos SSID/senha)
  const hasEquipments = associations.some(assoc => 
    assoc.asset_solution_name?.toUpperCase() !== 'CHIP' && assoc.asset_solution_id !== 11
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEntryDate) {
      toast.error('Selecione uma nova data de entrada');
      return;
    }

    // Validar datas
    const dateError = validateDateRange(newEntryDate, newExitDate);
    if (dateError) {
      toast.error(dateError);
      return;
    }

    setIsLoading(true);

    try {
      // Atualizar todas as associações do grupo
      const updates = associations.map(async (association) => {
        const updateData: any = {
          entry_date: formatDateForSubmission(newEntryDate),
        };

        if (newExitDate) {
          updateData.exit_date = formatDateForSubmission(newExitDate);
        }

        if (notes.trim()) {
          updateData.notes = notes.trim();
        }

        // Adicionar SSID e senha apenas para equipamentos
        const isEquipment = association.asset_solution_name?.toUpperCase() !== 'CHIP' && 
                           association.asset_solution_id !== 11;
        
        if (isEquipment) {
          if (ssid.trim()) {
            updateData.ssid = ssid.trim();
          }
          if (networkPassword.trim()) {
            updateData.pass = networkPassword.trim();
          }
        }

        const { error } = await supabase
          .from('asset_client_assoc')
          .update(updateData)
          .eq('id', association.id);

        if (error) throw error;
      });

      await Promise.all(updates);

      toast.success(`${totalAssets} associação${totalAssets > 1 ? 'ões' : ''} atualizada${totalAssets > 1 ? 's' : ''} com sucesso!`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar associações:', error);
      toast.error('Erro ao atualizar associações. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#020CBC] font-neue-haas font-bold">
            <Users className="h-5 w-5 text-[#03F9FF]" />
            Editar Grupo de Associações
          </DialogTitle>
          <DialogDescription className="font-neue-haas">
            Edite as datas de {totalAssets} associação{totalAssets > 1 ? 'ões' : ''} do cliente {clientName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações do grupo */}
          <div className="bg-[#4D2BFB]/5 rounded-lg p-3 border border-[#4D2BFB]/20">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-[#03F9FF]" />
              <span className="font-bold text-[#020CBC] font-neue-haas">Informações do Grupo</span>
            </div>
            <div className="text-sm text-muted-foreground font-neue-haas">
              <p>Cliente: <span className="font-medium text-[#020CBC]">{clientName}</span></p>
              <p>Total de ativos: <span className="font-medium text-[#020CBC]">{totalAssets}</span></p>
            </div>
          </div>

          {/* Nova data de entrada */}
          <div className="space-y-2">
            <Label className="font-neue-haas font-bold text-[#020CBC]">
              Nova Data de Entrada *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-[#4D2BFB]/30 hover:border-[#4D2BFB] font-neue-haas",
                    !newEntryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newEntryDate ? format(newEntryDate, "PPP", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newEntryDate}
                  onSelect={setNewEntryDate}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Nova data de saída */}
          <div className="space-y-2">
            <Label className="font-neue-haas font-bold text-[#020CBC]">
              Nova Data de Saída (opcional)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-[#4D2BFB]/30 hover:border-[#4D2BFB] font-neue-haas",
                    !newExitDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newExitDate ? format(newExitDate, "PPP", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newExitDate}
                  onSelect={setNewExitDate}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Campos SSID e Senha (apenas se houver equipamentos) */}
          {hasEquipments && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="group-ssid" className="font-neue-haas font-bold text-[#020CBC] flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  SSID da Rede
                </Label>
                <Input
                  id="group-ssid"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="#WiFi.LEGAL"
                  className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-password" className="font-neue-haas font-bold text-[#020CBC] flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Senha da Rede
                </Label>
                <Input
                  id="group-password"
                  type="password"
                  value={networkPassword}
                  onChange={(e) => setNetworkPassword(e.target.value)}
                  placeholder="123legal"
                  className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
                />
              </div>
            </div>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="group-notes" className="font-neue-haas font-bold text-[#020CBC]">
              Observações (opcional)
            </Label>
            <Input
              id="group-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicionar observações sobre a edição"
              className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-neue-haas"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!newEntryDate || isLoading}
              className="flex-1 bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white font-neue-haas font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
