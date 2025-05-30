
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/asset';
import { Search, Users, Plus } from "lucide-react";
import { toast } from 'sonner';
import { ClientFormSimplified } from './ClientFormSimplified';
import { formatPhoneNumber, parsePhoneFromScientific } from '@/utils/phoneFormatter';

interface ClientSelectionSimplifiedProps {
  onClientSelected: (client: Client) => void;
}

export const ClientSelectionSimplified: React.FC<ClientSelectionSimplifiedProps> = ({
  onClientSelected
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  // Buscar clientes apenas por nome e telefone
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .is('deleted_at', null)
        .order('nome');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Filtrar clientes baseado na busca por nome e telefone apenas
  const filteredClients = clients.filter(client => 
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contato.toString().includes(searchTerm)
  );

  const handleClientSelect = (clientData: any) => {
    // Map database fields to Client interface
    const client: Client = {
      id: clientData.uuid,
      uuid: clientData.uuid,
      nome: clientData.nome,
      cnpj: clientData.cnpj,
      email: clientData.email || '',
      contato: clientData.contato,
      created_at: clientData.created_at,
      updated_at: clientData.updated_at,
      deleted_at: clientData.deleted_at
    };
    
    onClientSelected(client);
    toast.success(`Cliente ${client.nome} selecionado!`);
  };

  const handleNewClientCreated = (client: Client) => {
    setIsNewClientModalOpen(false);
    onClientSelected(client);
    toast.success(`Cliente ${client.nome} cadastrado e selecionado!`);
  };

  const handleOpenNewClientModal = () => {
    setIsNewClientModalOpen(true);
  };

  const handleCancelNewClient = () => {
    setIsNewClientModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Campo de busca */}
      <div className="space-y-2">
        <Label htmlFor="client-search">Buscar Cliente</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="client-search"
            placeholder="Digite o nome ou telefone do cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando clientes...</p>
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredClients.map((client) => (
              <Card 
                key={client.uuid} 
                className="cursor-pointer hover:bg-[#4D2BFB]/5 hover:border-[#4D2BFB]/40 transition-all"
                onClick={() => handleClientSelect(client)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#03F9FF]/20 rounded-lg">
                      <Users className="h-4 w-4 text-[#4D2BFB]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[#020CBC] font-neue-haas">
                        {client.nome}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tel: {formatPhoneNumber(parsePhoneFromScientific(client.contato))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-8 space-y-4">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Nenhum cliente encontrado para "{searchTerm}"
            </p>
            <Button
              onClick={handleOpenNewClientModal}
              className="bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white font-neue-haas font-bold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Novo Cliente
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Digite algo para buscar clientes ou cadastre um novo
            </p>
            <Button
              onClick={handleOpenNewClientModal}
              variant="outline"
              className="border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB]/10 font-neue-haas"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Novo Cliente
            </Button>
          </div>
        )}
      </div>

      {/* Modal de criação de cliente */}
      <Dialog open={isNewClientModalOpen} onOpenChange={setIsNewClientModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-neue-haas font-bold text-[#020CBC]">
              Cadastrar Novo Cliente
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ClientFormSimplified
              onSubmit={handleNewClientCreated}
              onCancel={handleCancelNewClient}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
