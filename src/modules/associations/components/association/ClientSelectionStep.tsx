
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Building } from "lucide-react";
import { useClientsData } from '@modules/clients/hooks/useClientsData';
import { useAssetAssociationState } from '@modules/assets/hooks/useAssetAssociationState';
import { Client } from '@/types/client';

export const ClientSelectionStep: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { clients = [], isLoading } = useClientsData();
  const { selectedClient, setSelectedClient, setCurrentStep } = useAssetAssociationState();

  const filteredClients = clients.filter(client => 
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.cnpj && client.cnpj.includes(searchTerm)) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleClientSelect = (client: Client) => {
    console.log('ClientSelectionStep: Cliente selecionado', client.uuid);
    setSelectedClient(client);
    // Automaticamente avançar para próximo step
    setTimeout(() => {
      setCurrentStep('assets');
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4D2BFB] mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar cliente por nome, CNPJ ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-[#4D2BFB]/20 focus:border-[#4D2BFB]"
        />
      </div>

      {/* Selected Client Display */}
      {selectedClient && (
        <Card className="border-[#03F9FF] bg-[#03F9FF]/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[#020CBC] flex items-center gap-2">
              <Building className="h-4 w-4" />
              Cliente Selecionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{selectedClient.nome}</h3>
                {selectedClient.cnpj && (
                  <p className="text-sm text-muted-foreground">CNPJ: {selectedClient.cnpj}</p>
                )}
                {selectedClient.email && (
                  <p className="text-sm text-muted-foreground">Email: {selectedClient.email}</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedClient(null)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Alterar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clients List */}
      {!selectedClient && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredClients.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredClients.map((client) => (
              <Card 
                key={client.uuid} 
                className="hover:shadow-md transition-shadow cursor-pointer border-[#4D2BFB]/20 hover:border-[#4D2BFB]/40"
                onClick={() => handleClientSelect(client)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-[#020CBC]">{client.nome}</h3>
                        <Badge variant="outline" className="text-xs">
                          {client.cnpj ? 'PJ' : 'PF'}
                        </Badge>
                      </div>
                      {client.cnpj && (
                        <p className="text-sm text-muted-foreground">CNPJ: {client.cnpj}</p>
                      )}
                      {client.email && (
                        <p className="text-sm text-muted-foreground">Email: {client.email}</p>
                      )}
                       <p className="text-sm text-muted-foreground">
                         Responsável: {client.responsavel}
                       </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[#4D2BFB]">
                      Selecionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Action Buttons */}
      {selectedClient && (
        <div className="flex justify-end pt-4">
          <Button 
            onClick={() => setCurrentStep('assets')}
            className="bg-[#4D2BFB] hover:bg-[#4D2BFB]/90"
          >
            Continuar para Seleção de Ativos
          </Button>
        </div>
      )}
    </div>
  );
};
