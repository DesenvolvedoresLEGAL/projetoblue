
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Plus, Building, Mail, Phone, FileText } from "lucide-react";
import { ClientFormSimplified } from './ClientFormSimplified';

interface Client {
  uuid: string;
  nome: string;
  cnpj: string;
  contato: number;
  email?: string;
}

interface ClientSelectionSimplifiedProps {
  selectedClient: Client | null;
  onSelectClient: (client: Client | null) => void;
}

export const ClientSelectionSimplified: React.FC<ClientSelectionSimplifiedProps> = ({
  selectedClient,
  onSelectClient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: clients = [], isLoading, refetch } = useQuery({
    queryKey: ['clients', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select('*')
        .is('deleted_at', null)
        .order('nome');

      if (searchTerm.trim()) {
        // Buscar por nome ou CNPJ
        query = query.or(`nome.ilike.%${searchTerm}%,cnpj.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !showCreateForm
  });

  const handleClientCreated = (newClient: Client) => {
    setShowCreateForm(false);
    onSelectClient(newClient);
    refetch(); // Atualizar a lista de clientes
  };

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  };

  const formatPhone = (phone: number) => {
    const phoneStr = phone.toString();
    if (phoneStr.length === 11) {
      return phoneStr.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phoneStr.length === 10) {
      return phoneStr.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phoneStr;
  };

  if (showCreateForm) {
    return (
      <Card className="border-[#4D2BFB]/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-[#03F9FF]" />
            Criar Novo Cliente
          </CardTitle>
          <CardDescription>
            Preencha os dados do novo cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientFormSimplified
            onClientCreated={handleClientCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#4D2BFB]/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-[#03F9FF]" />
          Seleção de Cliente
        </CardTitle>
        <CardDescription>
          Selecione o cliente para associar aos ativos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20"
          />
        </div>

        {/* Botão Criar Novo Cliente */}
        <Button
          onClick={() => setShowCreateForm(true)}
          variant="outline"
          className="w-full border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB]/10"
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar Novo Cliente
        </Button>

        <Separator />

        {/* Cliente Selecionado */}
        {selectedClient && (
          <div className="space-y-3">
            <h4 className="font-semibold text-[#020CBC] flex items-center gap-2">
              <Building className="h-4 w-4" />
              Cliente Selecionado
            </h4>
            <div className="bg-[#4D2BFB]/5 rounded-lg p-4 border border-[#4D2BFB]/20">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-semibold text-[#020CBC]">{selectedClient.nome}</h5>
                  <p className="text-sm text-muted-foreground">
                    CNPJ: {formatCNPJ(selectedClient.cnpj)}
                  </p>
                </div>
                <Badge className="bg-[#03F9FF]/20 text-[#020CBC] hover:bg-[#03F9FF]/30">
                  Selecionado
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span>{formatPhone(selectedClient.contato)}</span>
                </div>
                {selectedClient.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span>{selectedClient.email}</span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => onSelectClient(null)}
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
              >
                Alterar Cliente
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Clientes (apenas se não houver cliente selecionado) */}
        {!selectedClient && (
          <div className="space-y-3">
            <h4 className="font-semibold text-[#020CBC]">
              {searchTerm ? 'Resultados da Busca' : 'Clientes Disponíveis'}
            </h4>
            
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Carregando clientes...
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {clients.map((client) => (
                  <div
                    key={client.uuid}
                    onClick={() => onSelectClient(client)}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-[#4D2BFB]/5 hover:border-[#4D2BFB]/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <h5 className="font-medium text-[#020CBC]">{client.nome}</h5>
                      <p className="text-sm text-muted-foreground">
                        CNPJ: {formatCNPJ(client.cnpj)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {formatPhone(client.contato)}
                        </span>
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
