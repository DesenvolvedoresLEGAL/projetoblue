
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface Client {
  uuid: string;
  empresa: string;
  responsavel: string;
  telefones: string[];
  cnpj?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface EditClientFormData {
  empresa: string;
  responsavel: string;
  telefones: string[];
  email: string;
  cnpj: string;
}

interface ClientEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export const ClientEditDialog: React.FC<ClientEditDialogProps> = ({
  isOpen,
  onClose,
  client
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const [editFormData, setEditFormData] = useState<EditClientFormData>({
    empresa: client?.empresa || '',
    responsavel: client?.responsavel || '',
    telefones: client?.telefones.length > 0 ? client.telefones : [''],
    email: client?.email || '',
    cnpj: client?.cnpj || ''
  });

  React.useEffect(() => {
    if (client) {
      setEditFormData({
        empresa: client.empresa,
        responsavel: client.responsavel,
        telefones: client.telefones.length > 0 ? client.telefones : [''],
        email: client.email || '',
        cnpj: client.cnpj || ''
      });
    }
  }, [client]);

  const addTelefone = () => {
    if (editFormData.telefones.length < 5) {
      setEditFormData(prev => ({
        ...prev,
        telefones: [...prev.telefones, '']
      }));
    }
  };

  const removeTelefone = (index: number) => {
    if (editFormData.telefones.length > 1) {
      setEditFormData(prev => ({
        ...prev,
        telefones: prev.telefones.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTelefone = (index: number, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      telefones: prev.telefones.map((tel, i) => i === index ? value : tel)
    }));
  };

  const handleUpdateClient = async () => {
    if (!client) return;

    if (!editFormData.empresa.trim()) {
      toast.error("O campo empresa é obrigatório.");
      return;
    }

    if (!editFormData.responsavel.trim()) {
      toast.error("O campo responsável é obrigatório.");
      return;
    }

    const telefonesFiltrados = editFormData.telefones.filter(tel => tel.trim());
    if (telefonesFiltrados.length === 0) {
      toast.error("Pelo menos um telefone deve ser informado.");
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          empresa: editFormData.empresa.trim(),
          responsavel: editFormData.responsavel.trim(),
          telefones: telefonesFiltrados,
          email: editFormData.email.trim() || null,
          cnpj: editFormData.cnpj.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('uuid', client.uuid);

      if (error) throw error;

      toast.success("Cliente atualizado com sucesso.");

      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-logs'] });
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error("Erro ao atualizar cliente. Tente novamente.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#020CBC]">Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize as informações do cliente. Campos obrigatórios estão marcados com *.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="empresa" className="text-sm font-medium text-[#020CBC]">Empresa *</Label>
              <Input
                id="empresa"
                value={editFormData.empresa}
                onChange={(e) => setEditFormData(prev => ({ ...prev, empresa: e.target.value }))}
                placeholder="Nome da empresa"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="responsavel" className="text-sm font-medium text-[#020CBC]">Responsável *</Label>
              <Input
                id="responsavel"
                value={editFormData.responsavel}
                onChange={(e) => setEditFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                placeholder="Nome do responsável"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-[#020CBC]">Telefones *</Label>
            {editFormData.telefones.map((telefone, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={telefone}
                  onChange={(e) => updateTelefone(index, e.target.value)}
                  placeholder="(XX) XXXXX-XXXX"
                  className="flex-1"
                  required={index === 0}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeTelefone(index)}
                  disabled={editFormData.telefones.length === 1}
                  className="px-3"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTelefone}
              disabled={editFormData.telefones.length >= 5}
              className="w-full mt-2 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Telefone
            </Button>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm font-medium text-[#020CBC]">Email</Label>
            <Input
              id="email"
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="exemplo@empresa.com"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cnpj" className="text-sm font-medium text-[#020CBC]">CNPJ</Label>
            <Input
              id="cnpj"
              value={editFormData.cnpj}
              onChange={(e) => setEditFormData(prev => ({ ...prev, cnpj: e.target.value }))}
              placeholder="00.000.000/0000-00"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateClient}
            disabled={isUpdating}
            className="bg-[#4D2BFB] text-white hover:bg-[#3a1ecc]"
          >
            {isUpdating ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
