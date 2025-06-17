import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { showFriendlyError } from '@/utils/errorTranslator';

interface EditAssociationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  association: any;
  onAssociationUpdated: () => void;
}

export const EditAssociationDialog: React.FC<EditAssociationDialogProps> = ({
  isOpen,
  onClose,
  association,
  onAssociationUpdated
}) => {
  const [formData, setFormData] = useState({
    ssid: '',
    pass: '',
    notes: '',
    gb: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (association) {
      setFormData({
        ssid: association.ssid || '',
        pass: association.pass || '',
        notes: association.notes || '',
        gb: association.gb ? association.gb.toString() : ''
      });
    }
  }, [association]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!association) return;
    
    setIsLoading(true);
    
    try {
      const updateData = {
        ssid: formData.ssid || null,
        pass: formData.pass || null,
        notes: formData.notes || null,
        gb: formData.gb ? parseInt(formData.gb) : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('asset_client_assoc')
        .update(updateData)
        .eq('id', association.id);

      if (error) {
        console.error('Erro ao atualizar associação:', error);
        const friendlyMessage = showFriendlyError(error, 'update');
        throw error;
      }

      toast.success('Associação atualizada com sucesso!');
      onAssociationUpdated();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar associação:', error);
      const friendlyMessage = showFriendlyError(error, 'update');
      toast.error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-neue-haas font-bold text-[#020CBC]">
            Editar Associação
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SSID */}
            <div className="space-y-2">
              <Label htmlFor="ssid">SSID</Label>
              <Input
                id="ssid"
                name="ssid"
                value={formData.ssid}
                onChange={handleChange}
                placeholder="Digite o SSID"
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="pass">Senha</Label>
              <Input
                id="pass"
                name="pass"
                value={formData.pass}
                onChange={handleChange}
                placeholder="Digite a senha"
              />
            </div>

            {/* GB */}
            <div className="space-y-2">
              <Label htmlFor="gb">GB</Label>
              <Input
                id="gb"
                name="gb"
                value={formData.gb}
                onChange={handleChange}
                placeholder="Digite a quantidade de GB"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white font-neue-haas"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
