
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clientSchema, ClientFormValues } from '@/schemas/assetSchemas';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/asset';
import { toast } from 'sonner';

interface ClientFormProps {
  onSubmit: (client: Client) => void;
  onCancel: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema)
  });

  const handleFormSubmit = async (data: ClientFormValues) => {
    try {
      // Criar cliente
      const { data: newClient, error } = await supabase
        .from('clients')
        .insert({
          nome: data.nome,
          cnpj: '00000000000000', // CNPJ placeholder para compatibilidade
          email: data.email || null,
          contato: data.contato
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating client:', error);
        toast.error('Erro ao cadastrar cliente');
        return;
      }

      const client: Client = {
        id: newClient.uuid,
        uuid: newClient.uuid,
        nome: newClient.nome,
        cnpj: newClient.cnpj,
        email: newClient.email || '',
        contato: newClient.contato,
        created_at: newClient.created_at,
        updated_at: newClient.updated_at,
        deleted_at: newClient.deleted_at
      };

      onSubmit(client);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Erro inesperado ao cadastrar cliente');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome/Razão Social *</Label>
        <Input
          id="nome"
          placeholder="Digite o nome do cliente..."
          {...register('nome')}
          disabled={isSubmitting}
        />
        {errors.nome && (
          <span className="text-sm text-destructive">{errors.nome.message}</span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="cliente@empresa.com"
          {...register('email')}
          disabled={isSubmitting}
        />
        {errors.email && (
          <span className="text-sm text-destructive">{errors.email.message}</span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contato">Telefone *</Label>
        <Input
          id="contato"
          type="number"
          placeholder="11999999999"
          {...register('contato', { valueAsNumber: true })}
          disabled={isSubmitting}
        />
        {errors.contato && (
          <span className="text-sm text-destructive">{errors.contato.message}</span>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar Cliente'}
        </Button>
      </div>
    </form>
  );
};
