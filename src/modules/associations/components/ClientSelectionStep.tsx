/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatPhoneForStorage } from "@/utils/phoneFormatter";
import { formatCNPJ } from "@/utils/formatters";

interface ClientSelectionStepProps {
  state: any;
  dispatch: any;
}

export const ClientSelectionStep: React.FC<ClientSelectionStepProps> = ({ state, dispatch }) => {
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(() => {
    const savedIsCreateModalOpen = localStorage.getItem('isCreateModalOpen');
    if (savedIsCreateModalOpen) {
      return savedIsCreateModalOpen === 'true';
    }
    return false;
  });
  const [newClient, setNewClient] = useState(() => {
    const savedClient = localStorage.getItem('newClient');
    if (savedClient) {
      return JSON.parse(savedClient);
    }
    return {
      nome: "",
      empresa: "",
      responsavel: "",
      contato: "",
      email: "",
      cnpj: ""
    }
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    localStorage.setItem('newClient', JSON.stringify(newClient));
    localStorage.setItem('isCreateModalOpen', String(isCreateModalOpen));
  }, [newClient, isCreateModalOpen]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .or('deleted_at.is.null')
        .order('nome');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      
      toast.error('Erro ao carregar clientes');
    }
  };

  const handleCreateClient = async () => {
    try {
      if (!newClient.nome || !newClient.empresa || !newClient.responsavel || !newClient.contato) {
        toast.warning("Campos obrigatórios\nPreencha Nome, Empresa, Responsável e Contato");
        return;
      }

      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...newClient,
          contato: parseInt(newClient.contato)
        })
        .select()
        .single();

      if (error) throw error;

      setClients(prev => [...prev, data]);
      dispatch({ type: 'SET_CLIENT', payload: data });
      setIsCreateModalOpen(false);
      setNewClient({
        nome: "",
        empresa: "",
        responsavel: "",
        contato: "",
        email: "",
        cnpj: ""
      });

      toast.message('Cliente criado com sucesso!');
    } catch (error) {
      
      toast.error("Erro ao criar cliente");
    }
  };

  const filteredClients = clients.filter(client =>
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.empresa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="client-search">Buscar Cliente</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="client-search"
              placeholder="Digite o nome ou empresa do cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-end">
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastro Rápido de Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={newClient.nome}
                    onChange={(e) => setNewClient(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Input
                    id="empresa"
                    value={newClient.empresa}
                    onChange={(e) => setNewClient(prev => ({ ...prev, empresa: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="responsavel">Responsável *</Label>
                  <Input
                    id="responsavel"
                    value={newClient.responsavel}
                    onChange={(e) => setNewClient(prev => ({ ...prev, responsavel: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="contato">Telefone *</Label>
                  <Input
                    id="contato"
                    type="tel"
                    value={newClient.contato}
                    onChange={(e) => setNewClient(prev => ({ ...prev, contato: formatPhoneForStorage(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={newClient.cnpj}
                    onChange={(e) => setNewClient(prev => ({ ...prev, cnpj: formatCNPJ(e.target.value) }))}
                  />
                </div>
                <Button onClick={handleCreateClient} className="w-full">
                  Criar Cliente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>


      <div className="grid gap-4 h-[40vh] overflow-y-scroll grid-cols-1 md:grid-cols-2">
        {filteredClients.map((client) => (
          <Card 
          key={client.uuid} 
          className={`cursor-pointer transition-colors hover:border-primary ${
            state.client?.uuid === client.uuid ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => dispatch({ type: 'SET_CLIENT', payload: client })}
            >
            <CardContent className="p-4">
              <div className="space-y-1">
                <p className="font-semibold">{client.nome}</p>
                <p className="text-sm text-muted-foreground">{client.empresa}</p>
                <p className="text-sm text-muted-foreground">Responsável: {client.responsavel}</p>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

        {state.client && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-green-800">
                <User className="mr-2 h-5 w-5" />
                Cliente Selecionado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-semibold">{state.client.nome}</p>
                <p className="text-sm text-muted-foreground">{state.client.empresa}</p>
                <p className="text-sm text-muted-foreground">Responsável: {state.client.responsavel}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
      {filteredClients.length === 0 && searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum cliente encontrado com "{searchTerm}"</p>
          <p className="text-sm">Crie um novo cliente usando o botão acima</p>
        </div>
      )}
    </div>
  );
};
