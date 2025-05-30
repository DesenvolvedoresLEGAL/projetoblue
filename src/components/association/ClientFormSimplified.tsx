
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Save, X } from "lucide-react";

interface Client {
  uuid: string;
  nome: string;
  cnpj: string;
  contato: number;
  email?: string;
}

interface ClientFormSimplifiedProps {
  onClientCreated: (client: Client) => void;
  onCancel: () => void;
}

export const ClientFormSimplified: React.FC<ClientFormSimplifiedProps> = ({
  onClientCreated,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    contato: '',
    email: ''
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: typeof formData) => {
      // Validações básicas
      if (!clientData.nome.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!clientData.cnpj.trim()) {
        throw new Error('CNPJ é obrigatório');
      }
      if (!clientData.contato.trim()) {
        throw new Error('Contato é obrigatório');
      }

      // Limpar e validar CNPJ
      const cnpjClean = clientData.cnpj.replace(/\D/g, '');
      if (cnpjClean.length !== 14) {
        throw new Error('CNPJ deve ter 14 dígitos');
      }

      // Validar contato
      const contatoNum = parseInt(clientData.contato.replace(/\D/g, ''));
      if (isNaN(contatoNum) || contatoNum < 1000000000) {
        throw new Error('Contato deve ser um número válido');
      }

      const insertData: any = {
        nome: clientData.nome.trim(),
        cnpj: cnpjClean,
        contato: contatoNum
      };

      if (clientData.email && clientData.email.trim()) {
        insertData.email = clientData.email.trim();
      }

      const { data, error } = await supabase
        .from('clients')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newClient) => {
      toast.success('Cliente criado com sucesso!');
      onClientCreated(newClient);
    },
    onError: (error: any) => {
      console.error('Erro ao criar cliente:', error);
      toast.error(error.message || 'Erro ao criar cliente');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClientMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
    }
    return value;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-sm font-medium">
            Nome da Empresa *
          </Label>
          <Input
            id="nome"
            type="text"
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            placeholder="Digite o nome da empresa"
            required
            className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20"
          />
        </div>

        {/* CNPJ */}
        <div className="space-y-2">
          <Label htmlFor="cnpj" className="text-sm font-medium">
            CNPJ *
          </Label>
          <Input
            id="cnpj"
            type="text"
            value={formData.cnpj}
            onChange={(e) => handleChange('cnpj', formatCNPJ(e.target.value))}
            placeholder="00.000.000/0000-00"
            required
            maxLength={18}
            className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20"
          />
        </div>

        {/* Contato */}
        <div className="space-y-2">
          <Label htmlFor="contato" className="text-sm font-medium">
            Telefone/Celular *
          </Label>
          <Input
            id="contato"
            type="text"
            value={formData.contato}
            onChange={(e) => handleChange('contato', formatPhone(e.target.value))}
            placeholder="(00) 00000-0000"
            required
            maxLength={15}
            className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email (opcional)
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="contato@empresa.com"
            className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20"
          />
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={createClientMutation.isPending}
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={createClientMutation.isPending}
          className="flex-1 bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white font-semibold"
        >
          {createClientMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Criando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Criar Cliente
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
