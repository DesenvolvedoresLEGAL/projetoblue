
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/asset';
import { Search, Users } from "lucide-react";
import { toast } from 'sonner';

interface ClientSelectionSimplifiedProps {
  onClientSelected: (client: Client) => void;
}

export const ClientSelectionSimplified: React.FC<ClientSelectionSimplifiedProps> = ({
  onClientSelected
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Buscar clientes
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

  // Filtrar clientes baseado na busca
  const filteredClients = clients.filter(client => 
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cnpj.includes(searchTerm) ||
    client.contato.includes(searchTerm)
  );

  const handleClientSelect = (client: Client) => {
    onClientSelected(client);
    toast.success(`Cliente ${client.nome} selecionado!`);
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
            placeholder="Digite o nome, CNPJ ou telefone do cliente..."
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
                key={client.id} 
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
                        CNPJ: {client.cnpj} • Tel: {client.contato}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-8">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Nenhum cliente encontrado para "{searchTerm}"
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Digite algo para buscar clientes
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
