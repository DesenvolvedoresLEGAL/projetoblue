import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Client } from '@/types/client';
import { supabase } from '@/integrations/supabase/client';
import { mapDatabaseClientToFrontend, normalizePhoneForStorage } from '@/utils/clientMappers';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Plus, Trash } from 'lucide-react';
import { showFriendlyError } from '@/utils/errorTranslator';

interface ClientEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onClientUpdated: (client: Client) => void;
}

const ClientEditDialog = ({ isOpen, onClose, client, onClientUpdated }: ClientEditDialogProps) => {
  const [formData, setFormData] = useState({
    empresa: '',
    responsavel: '',
    telefones: [] as string[],
    email: '',
    cnpj: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (client) {
      setFormData({
        empresa: client.empresa || '',
        responsavel: client.responsavel || '',
        telefones: client.telefones || [],
        email: client.email || '',
        cnpj: client.cnpj || '',
      });
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newTelefones = [...formData.telefones];
    newTelefones[index] = value;
    setFormData(prev => ({ ...prev, telefones: newTelefones }));
  };

  const addPhoneField = () => {
    setFormData(prev => ({ ...prev, telefones: [...prev.telefones, ''] }));
  };

  const removePhoneField = (index: number) => {
    const newTelefones = [...formData.telefones];
    newTelefones.splice(index, 1);
    setFormData(prev => ({ ...prev, telefones: newTelefones }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.empresa.trim() || !formData.responsavel.trim()) {
      toast.error('Empresa e responsável são campos obrigatórios.');
      return;
    }

    const validPhones = formData.telefones.filter(phone => phone.trim());
    if (validPhones.length === 0) {
      toast.error('É necessário informar pelo menos um telefone válido.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanPhones = formData.telefones
        .filter(tel => tel.trim())
        .map(tel => normalizePhoneForStorage(tel));

      const dbData = {
        empresa: formData.empresa.trim(),
        responsavel: formData.responsavel.trim(),
        telefones: cleanPhones,
        email: formData.email?.trim() || null,
        cnpj: formData.cnpj?.trim() || null,
        // Campos legados para compatibilidade
        nome: formData.empresa.trim(),
        contato: cleanPhones.length > 0 ? parseInt(cleanPhones[0]) || 0 : 0
      };

      const { data, error } = await supabase
        .from('clients')
        .update(dbData)
        .eq('uuid', client?.uuid)
        .select()
        .single();

      if (error) throw error;

      const updatedClient = mapDatabaseClientToFrontend(data);
      onClientUpdated(updatedClient);
      onClose();
      toast.success('Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      showFriendlyError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Altere as informações do cliente conforme necessário.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa</Label>
            <Input
              id="empresa"
              value={formData.empresa}
              onChange={handleChange}
              placeholder="Nome da empresa"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              value={formData.responsavel}
              onChange={handleChange}
              placeholder="Nome do responsável"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Telefones</Label>
            {formData.telefones.map((telefone, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    type="tel"
                    placeholder="Telefone"
                    value={telefone}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePhoneField(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addPhoneField}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Telefone
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              placeholder="CNPJ"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Atualizando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientEditDialog;
