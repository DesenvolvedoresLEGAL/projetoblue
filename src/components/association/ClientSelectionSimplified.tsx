
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
import { ClientFormSimplified } from './ClientFormSimplified';
import { formatPhoneNumber, normalizePhoneForSearch, parsePhoneFromScientific } from '@/utils/phoneFormatter';

interface ClientSelectionSimplifiedProps {
  onClientSelected: (client: Client) => void;
}

export const ClientSelectionSimplified: React.FC<ClientSelectionSimplifiedProps> = ({ onClientSelected }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  // Buscar clientes apenas por nome e telefone (sem CNPJ)
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients-simplified', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select('*')
        .is('deleted_at', null)
        .order('nome');

      if (searchTerm.trim()) {
        const term = searchTerm.trim();
        const normalizedPhone = normalizePhoneForSearch(term);
        
        // Busca por nome ou telefone
        if (normalizedPhone && normalizedPhone.length >= 2) {
          query = query.or(
            `nome.ilike.%${term}%,` +
            `contato::text.ilike.%${normalizedPhone}%`
          );
        } else {
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
        cnpj: client.cnpj, // Mantém no objeto mas não exibe
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
    <Card className="border-[#4D2BFB]/20 bg-gradient-to-r from-[#4D2BFB]/5 to-[#03F9FF]/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#020CBC] font-neue-haas font-bold">
          <User className="h-5 w-5 text-[#03F9FF]" />
          Selecionar Cliente
        </CardTitle>
        <CardDescription className="font-neue-haas">
          Busque por nome ou telefone. Se não encontrar, cadastre um novo cliente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de busca simplificado */}
        <div className="space-y-2">
          <Label htmlFor="search" className="font-neue-haas font-bold text-[#020CBC]">Buscar Cliente</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="search"
              placeholder="Digite nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
            />
          </div>
          <div className="text-xs text-muted-foreground font-neue-haas">
            Exemplos: "João Silva", "(11) 99999-9999"
          </div>
        </div>

        {/* Lista de clientes simplificada */}
        <div className="space-y-2">
          {isLoadingClients ? (
            <div className="text-center py-8 text-muted-foreground font-neue-haas">
              Carregando clientes...
            </div>
          ) : clients.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              <div className="text-sm text-muted-foreground mb-2 font-neue-haas">
                {clients.length} cliente(s) encontrado(s):
              </div>
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="border rounded-lg p-3 hover:bg-[#4D2BFB]/10 cursor-pointer transition-colors hover:border-[#4D2BFB] bg-white"
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="font-bold text-[#020CBC] font-neue-haas">{client.nome}</div>
                  <div className="text-sm text-muted-foreground font-neue-haas">
                    Telefone: {formatPhoneNumber(parsePhoneFromScientific(client.contato))}
                  </div>
                  {client.email && (
                    <div className="text-sm text-muted-foreground font-neue-haas">
                      Email: {client.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : searchTerm.trim() ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-muted-foreground font-neue-haas">
                Nenhum cliente encontrado para "{searchTerm}"
              </div>
              <Button
                onClick={() => setIsNewClientModalOpen(true)}
                className="flex items-center gap-2 bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white font-neue-haas font-bold"
              >
                <Plus className="h-4 w-4" />
                Cadastrar Novo Cliente
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="text-muted-foreground font-neue-haas">
                Digite para buscar clientes existentes
              </div>
              <div className="text-sm text-muted-foreground font-neue-haas">
                Busca por nome ou telefone
              </div>
              <Button
                onClick={() => setIsNewClientModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2 border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB] hover:text-white font-neue-haas font-bold"
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
              <DialogTitle className="text-[#020CBC] font-neue-haas font-bold">Cadastrar Novo Cliente</DialogTitle>
              <DialogDescription className="font-neue-haas">
                Preencha os dados do cliente para continuar com a associação.
              </DialogDescription>
            </DialogHeader>
            <ClientFormSimplified
              onSubmit={handleNewClientCreated}
              onCancel={() => setIsNewClientModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
