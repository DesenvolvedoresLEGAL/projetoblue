
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
import { formatPhoneNumber, normalizePhoneForSearch, parsePhoneFromScientific } from '@/utils/phoneFormatter';

interface ClientSelectionProps {
  onClientSelected: (client: Client) => void;
}

export const ClientSelection: React.FC<ClientSelectionProps> = ({ onClientSelected }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  // Buscar clientes com busca aprimorada por nome e telefone apenas
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select('*')
        .is('deleted_at', null)
        .order('nome');

      if (searchTerm.trim()) {
        const term = searchTerm.trim();
        const normalizedPhone = normalizePhoneForSearch(term);
        
        // Busca por nome e telefone apenas
        if (normalizedPhone && normalizedPhone.length >= 2) {
          // Se o termo contém apenas números, busca também por telefone
          query = query.or(
            `nome.ilike.%${term}%,` +
            `contato::text.ilike.%${normalizedPhone}%`
          );
        } else {
          // Busca apenas por nome se não for numérico
          query = query.ilike('nome', `%${term}%`);
        }
      }

      const { data, error } = await query.limit(50);
      
      if (error) {
        console.error('Erro ao buscar clientes:', error);
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
    toast.success(`Cliente ${client.nome} selecionado com sucesso!`);
  };

  const handleNewClientCreated = (newClient: Client) => {
    setIsNewClientModalOpen(false);
    onClientSelected(newClient);
    toast.success('Cliente cadastrado e selecionado com sucesso!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Selecionar Cliente
        </CardTitle>
        <CardDescription>
          Busque por nome ou telefone. Se não encontrar, cadastre um novo cliente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de busca simplificado */}
        <div className="space-y-2">
          <Label htmlFor="search">Buscar Cliente</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="search"
              placeholder="Digite nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Exemplos: "João Silva", "(11) 99999-9999"
          </div>
        </div>

        {/* Lista de clientes simplificada */}
        <div className="space-y-2">
          {isLoadingClients ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando clientes...
            </div>
          ) : clients.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              <div className="text-sm text-muted-foreground mb-2">
                {clients.length} cliente(s) encontrado(s):
              </div>
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors hover:border-primary"
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="font-medium text-primary">{client.nome}</div>
                  <div className="text-sm text-muted-foreground">
                    Telefone: {formatPhoneNumber(parsePhoneFromScientific(client.contato))}
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
                Digite para buscar clientes existentes
              </div>
              <div className="text-sm text-muted-foreground">
                Busca por nome ou telefone
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
