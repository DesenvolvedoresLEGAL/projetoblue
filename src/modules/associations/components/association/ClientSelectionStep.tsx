
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAssetAssociationState } from '@modules/assets/hooks/useAssetAssociationState';
import { useClientsData } from '@modules/clients/hooks/useClientsData';
import { Search, User } from 'lucide-react';

export const ClientSelectionStep: React.FC = () => {
  const { selectedClient, setSelectedClient } = useAssetAssociationState();
  const { data: clients = [], isLoading } = useClientsData();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredClients = React.useMemo(() => {
    if (!searchTerm) return clients;
    return clients.filter(client =>
      client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cnpj?.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-gray-500" />
        <Input
          placeholder="Buscar cliente por nome, email ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Carregando clientes...</p>
        </div>
      ) : (
        <div className="grid gap-4 max-h-96 overflow-y-auto">
          {filteredClients.map((client) => (
            <Card 
              key={client.uuid}
              className={`cursor-pointer transition-colors ${
                selectedClient?.uuid === client.uuid 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedClient(client)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{client.nome}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      {client.email && <p>Email: {client.email}</p>}
                      {client.cnpj && <p>CNPJ: {client.cnpj}</p>}
                      <p>Contato: {client.contato}</p>
                    </div>
                  </div>
                  {selectedClient?.uuid === client.uuid && (
                    <div className="text-blue-600 font-semibold">
                      ✓ Selecionado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredClients.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente disponível'}
        </div>
      )}
    </div>
  );
};
