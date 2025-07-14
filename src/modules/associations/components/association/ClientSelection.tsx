
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Building, User, Phone, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';

interface ClientSelectionProps {
  selectedClient?: Client | null;
  onClientSelected: (client: Client) => void;
}

export const ClientSelection: React.FC<ClientSelectionProps> = ({
  selectedClient,
  onClientSelected
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select('*')
        .is('deleted_at', null)
        .order('nome');

      if (searchTerm.trim()) {
        query = query.or(`nome.ilike.%${searchTerm}%,empresa.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map((dbClient): Client => ({
        uuid: dbClient.uuid,
        nome: dbClient.nome,
        empresa: dbClient.empresa,
        responsavel: dbClient.responsavel,
        contato: dbClient.contato.toString(), // Convert number to string
        email: dbClient.email || undefined,
        cnpj: dbClient.cnpj || undefined,
        telefones: dbClient.telefones,
        created_at: dbClient.created_at,
        updated_at: dbClient.updated_at,
        deleted_at: dbClient.deleted_at || undefined
      }));
    }
  });

  const handleClientSelect = (client: Client) => {
    onClientSelected(client);
  };

  return (
    <Card className="border-[#4D2BFB]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-[#03F9FF]" />
            Selecionar Cliente
          </CardTitle>
          <Button
            onClick={() => setShowNewClientForm(true)}
            className="bg-[#4D2BFB] hover:bg-[#4D2BFB]/90 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedClient ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{selectedClient.nome}</h3>
                <p className="text-sm text-gray-600">{selectedClient.empresa}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {selectedClient.responsavel}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {selectedClient.contato}
                  </div>
                  {selectedClient.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {selectedClient.email}
                    </div>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Selecionado
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onClientSelected(null as any)}
              className="mt-3"
            >
              Alterar Cliente
            </Button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, empresa ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">
                  Carregando clientes...
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum cliente encontrado</p>
                  {searchTerm && (
                    <p className="text-sm">
                      Tente ajustar os termos de busca
                    </p>
                  )}
                </div>
              ) : (
                clients.map((client) => (
                  <Card
                    key={client.uuid}
                    className="cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50/50"
                    onClick={() => handleClientSelect(client)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{client.nome}</h4>
                          <p className="text-sm text-gray-600">{client.empresa}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {client.responsavel}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {client.contato}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
