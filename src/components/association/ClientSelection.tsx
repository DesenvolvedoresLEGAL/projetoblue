
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, User } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/asset';
import { toast } from 'sonner';
import { ClientForm } from './ClientForm';

interface ClientSelectionProps {
  onClientSelected: (client: Client) => void;
}

export const ClientSelection: React.FC<ClientSelectionProps> = ({ onClientSelected }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Buscar clientes
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select('*')
        .is('deleted_at', null);

      if (searchTerm.trim()) {
        const term = `%${searchTerm.trim()}%`;
        query = query.or(`nome.ilike.${term},cnpj.ilike.${term},contato::text.ilike.${term}`);
      }

      const { data, error } = await query.order('nome');
      
      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      return data.map(client => ({
        id: client.uuid,
        uuid: client.uuid,
        nome: client.nome,
        cnpj: client.cnpj,
        email: client.email || '',
        contato: client.contato,
        created_at: client.created_at,
        updated_at: client.updated_at,
        deleted_at: client.deleted_at
      })) as Client[];
    },
    enabled: true
  });

  const handleClientSelect = (client: Client) => {
    onClientSelected(client);
  };

  const handleNewClientCreated = (newClient: Client) => {
    setIsNewClientModalOpen(false);
    onClientSelected(newClient);
    toast.success('Cliente cadastrado com sucesso!');
  };

  const filteredClients = clients;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Selecionar Cliente
        </CardTitle>
        <CardDescription>
          Busque por nome, CNPJ ou telefone. Se não encontrar, cadastre um novo cliente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de busca */}
        <div className="space-y-2">
          <Label htmlFor="search">Buscar Cliente</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="search"
              placeholder="Digite nome, CNPJ ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="space-y-2">
          {isLoadingClients ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando clientes...
            </div>
          ) : filteredClients.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="font-medium">{client.nome}</div>
                  <div className="text-sm text-muted-foreground">
                    CNPJ: {client.cnpj} | Telefone: {client.contato}
                  </div>
                  {client.email && (
                    <div className="text-sm text-muted-foreground">
                      Email: {client.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : searchTerm.trim() ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-muted-foreground">
                Nenhum cliente encontrado para "{searchTerm}"
              </div>
              <Button
                onClick={() => setIsNewClientModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Cadastrar Novo Cliente
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="text-muted-foreground">
                Digite para buscar clientes ou cadastre um novo
              </div>
              <Button
                onClick={() => setIsNewClientModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Cadastrar Novo Cliente
              </Button>
            </div>
          )}
        </div>

        {/* Modal de novo cliente */}
        <Dialog open={isNewClientModalOpen} onOpenChange={setIsNewClientModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados do cliente para continuar com a associação.
              </DialogDescription>
            </DialogHeader>
            <ClientForm
              onSubmit={handleNewClientCreated}
              onCancel={() => setIsNewClientModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
