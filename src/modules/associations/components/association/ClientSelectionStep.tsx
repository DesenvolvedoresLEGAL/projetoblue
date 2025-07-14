
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Plus, Building, Phone, Mail, User } from 'lucide-react';
import { useClients } from '@modules/associations/hooks/useClients';
import { Client } from '@/types/client';

interface ClientSelectionStepProps {
  onClientSelected: (client: Client) => void;
  selectedClient?: Client | null;
}

export const ClientSelectionStep: React.FC<ClientSelectionStepProps> = ({
  onClientSelected,
  selectedClient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { clients, isLoading } = useClients();

  const filteredClients = clients.filter(client => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      client.nome?.toLowerCase().includes(term) ||
      client.empresa?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.contato?.toString().includes(term)
    );
  });

  const handleClientSelect = (client: Client) => {
    console.log('Cliente selecionado:', client);
    onClientSelected(client);
  };

  if (selectedClient) {
    return (
      <Card className="border-[#4D2BFB]/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-[#03F9FF]" />
            Cliente Selecionado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-green-600" />
                <span className="font-medium">{selectedClient.empresa}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">{selectedClient.nome}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">{selectedClient.contato}</span>
              </div>
              {selectedClient.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">{selectedClient.email}</span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onClientSelected(null as any)}
              className="text-red-600 hover:bg-red-50"
            >
              Alterar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#4D2BFB]/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-[#03F9FF]" />
          Selecionar Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="client-search">Buscar Cliente</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="client-search"
              placeholder="Digite nome, empresa ou contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {filteredClients.length} cliente(s) encontrado(s)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="text-[#4D2BFB] border-[#4D2BFB] hover:bg-[#4D2BFB]/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">
              Carregando clientes...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum cliente encontrado</p>
              <p className="text-sm">Tente ajustar sua busca ou criar um novo cliente</p>
            </div>
          ) : (
            filteredClients.map((client) => (
              <Card
                key={client.uuid}
                className="cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50/50"
                onClick={() => handleClientSelect(client)}
              >
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{client.empresa}</span>
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                        Cliente
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{client.nome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{client.contato}</span>
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span>{client.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {showCreateForm && (
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-600 mb-3">
              Formulário de criação rápida será implementado aqui
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateForm(false)}
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
