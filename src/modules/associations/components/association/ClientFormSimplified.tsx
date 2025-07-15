import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { toast } from 'sonner';
import { mapDatabaseClientToFrontend, normalizePhoneForStorage } from '@/utils/clientMappers';
import { showFriendlyError } from '@/utils/errorTranslator';

interface ClientFormSimplifiedProps {
  onSubmit: (client: Client) => void;
  onCancel: () => void;
}

export const ClientFormSimplified: React.FC<ClientFormSimplifiedProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    empresa: '',
    responsavel: '',
    telefone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = () => {
    return !!(formData.empresa.trim() && formData.responsavel.trim() && formData.telefone.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.empresa.trim() || !formData.responsavel.trim() || !formData.telefone.trim()) {
      toast.error('Por favor, preencha empresa, responsável e telefone para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanPhone = normalizePhoneForStorage(formData.telefone);

      const dbData = {
        empresa: formData.empresa.trim(),
        responsavel: formData.responsavel.trim(),
        telefones: [cleanPhone],
        // Campos legados para compatibilidade
        nome: formData.empresa.trim(),
        contato: parseInt(cleanPhone) || 0
      };

      const { data, error } = await supabase
        .from('clients')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        if (import.meta.env.DEV) console.error('Erro ao criar cliente:', error);
        const friendlyMessage = showFriendlyError(error, 'create');
        throw error;
      }

      const newClient = mapDatabaseClientToFrontend(data);
      onSubmit(newClient);
      toast.success('Cliente cadastrado com sucesso!');
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erro ao cadastrar cliente:', error);
      const friendlyMessage = showFriendlyError(error, 'create');
      toast.error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="empresa">Empresa</Label>
        <Input
          type="text"
          id="empresa"
          value={formData.empresa}
          onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
          placeholder="Nome da empresa"
          required
        />
      </div>
      <div>
        <Label htmlFor="responsavel">Responsável</Label>
        <Input
          type="text"
          id="responsavel"
          value={formData.responsavel}
          onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
          placeholder="Nome do responsável"
          required
        />
      </div>
      <div>
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          type="tel"
          id="telefone"
          value={formData.telefone}
          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
          placeholder="Número de telefone"
          required
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cadastrando...
            </>
          ) : (
            'Cadastrar'
          )}
        </Button>
      </div>
    </form>
  );
};
