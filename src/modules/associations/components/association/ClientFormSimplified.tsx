
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientsData } from '@modules/clients/hooks/useClientsData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';
import { mapDatabaseClientToFrontend } from '@/utils/databaseMappers';
import { Client } from '@/types/client';

const clientSchema = z.object({
  empresa: z.string().min(1, 'Empresa é obrigatória'),
  responsavel: z.string().min(1, 'Responsável é obrigatório'),
  contato: z.string().min(1, 'Contato é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormSimplifiedProps {
  onClientCreated: (client: Client) => void;
  onCancel: () => void;
}

export const ClientFormSimplified: React.FC<ClientFormSimplifiedProps> = ({
  onClientCreated,
  onCancel,
}) => {
  const { refetch } = useClientsData();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      empresa: '',
      responsavel: '',
      contato: '',
      email: '',
    },
  });

  const onSubmit = async (values: ClientFormValues) => {
    try {
      const clientData = {
        nome: values.empresa, // Use empresa as nome
        empresa: values.empresa,
        responsavel: values.responsavel,
        contato: parseInt(values.contato),
        email: values.email || null,
        telefones: [values.contato], // Convert contato to telefones array
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        toast.error('Erro ao criar cliente');
        return;
      }

      // Convert the database response to the Client type
      const client = mapDatabaseClientToFrontend({
        ...data,
        telefones: data.telefones || []
      });

      toast.success('Cliente criado com sucesso!');
      refetch();
      onClientCreated(client);
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Erro ao criar cliente');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Criar Cliente Rápido</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="empresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsavel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contato *</FormLabel>
                  <FormControl>
                    <Input placeholder="Telefone de contato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                Criar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
