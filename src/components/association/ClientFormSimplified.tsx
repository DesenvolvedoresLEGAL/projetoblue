
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/asset';
import { toast } from 'sonner';
import { formatPhoneForStorage, formatPhoneNumber } from '@/utils/phoneFormatter';

interface ClientFormSimplifiedProps {
  onSubmit: (client: Client) => void;
  onCancel: () => void;
}

export const ClientFormSimplified: React.FC<ClientFormSimplifiedProps> = ({ onSubmit, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    contato: '',
    email: ''
  });

  // Validação básica
  const isFormValid = formData.nome.trim().length >= 2 && formData.contato.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error('Preencha pelo menos nome e telefone válidos');
      return;
    }

    setIsLoading(true);

    try {
      // Formatar telefone para armazenamento
      const formattedPhone = formatPhoneForStorage(formData.contato);
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          nome: formData.nome.trim(),
          cnpj: '00000000000000', // CNPJ placeholder - será removido futuramente
          contato: formattedPhone,
          email: formData.email.trim() || null
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar cliente:', error);
        throw error;
      }

      const newClient: Client = {
        id: data.uuid,
        uuid: data.uuid,
        nome: data.nome,
        cnpj: data.cnpj,
        email: data.email || '',
        contato: data.contato,
        created_at: data.created_at,
        updated_at: data.updated_at,
        deleted_at: data.deleted_at
      };

      onSubmit(newClient);
      toast.success('Cliente cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      toast.error('Erro ao cadastrar cliente. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Aplicar formatação visual durante a digitação
    const formatted = formatPhoneNumber(value);
    setFormData({ ...formData, contato: formatted });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome" className="font-neue-haas font-bold text-[#020CBC]">
          Nome do Cliente *
        </Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="Digite o nome completo"
          className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contato" className="font-neue-haas font-bold text-[#020CBC]">
          Telefone *
        </Label>
        <Input
          id="contato"
          value={formData.contato}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="(11) 99999-9999"
          className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="font-neue-haas font-bold text-[#020CBC]">
          Email (opcional)
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="cliente@empresa.com"
          className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-neue-haas"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
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
              Cadastrar Cliente
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
