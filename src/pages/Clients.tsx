
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Users, Calendar, Mail, Phone, Building, Hash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateForDisplay, formatDateTimeForDisplay } from '@/utils/dateUtils';

interface Client {
  uuid: string;
  empresa: string;
  responsavel: string;
  telefones: string[];
  cnpj?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

interface ClientLog {
  id: string;
  client_id: string;
  event_type: string;
  details: any;
  old_data?: any;
  new_data?: any;
  date: string;
  performed_by_email?: string;
}

const Clients = () => {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  // Buscar todos os clientes
  const { data: clients = [], isLoading: clientsLoading, error: clientsError } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('uuid, empresa, responsavel, telefones, cnpj, email, created_at, updated_at')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Client[];
    }
  });

  // Buscar logs de todos os clientes
  const { data: clientLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['client-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_logs')
        .select('id, client_id, event_type, details, old_data, new_data, date, performed_by_email')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as ClientLog[];
    }
  });

  const isLoading = clientsLoading || logsLoading;

  // Agrupar logs por cliente
  const logsByClient = clientLogs.reduce((acc, log) => {
    if (!acc[log.client_id]) acc[log.client_id] = [];
    acc[log.client_id].push(log);
    return acc;
  }, {} as Record<string, ClientLog[]>);

  // Função para alternar expansão do cliente
  const toggleClientExpansion = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  // Função para formatar logs em mensagens amigáveis
  const formatLogMessage = (log: ClientLog): string => {
    const empresa = log.new_data?.empresa || log.old_data?.empresa || 'Cliente';
    const date = formatDateTimeForDisplay(log.date);

    switch (log.event_type) {
      case 'CLIENTE_CRIADO':
        return `Cliente ${empresa} cadastrado no sistema em ${date}`;
      
      case 'CLIENTE_ATUALIZADO':
        if (log.old_data && log.new_data) {
          const changes: string[] = [];
          
          if (log.old_data.empresa !== log.new_data.empresa) {
            changes.push(`empresa alterada de '${log.old_data.empresa}' para '${log.new_data.empresa}'`);
          }
          if (log.old_data.email !== log.new_data.email) {
            changes.push(`email alterado de '${log.old_data.email || 'vazio'}' para '${log.new_data.email || 'vazio'}'`);
          }
          if (log.old_data.responsavel !== log.new_data.responsavel) {
            changes.push(`responsável alterado de '${log.old_data.responsavel}' para '${log.new_data.responsavel}'`);
          }
          if (JSON.stringify(log.old_data.telefones) !== JSON.stringify(log.new_data.telefones)) {
            changes.push(`telefones atualizados`);
          }
          if (log.old_data.cnpj !== log.new_data.cnpj) {
            changes.push(`CNPJ alterado de '${log.old_data.cnpj || 'vazio'}' para '${log.new_data.cnpj || 'vazio'}'`);
          }

          const changesText = changes.length > 0 ? changes.join(', ') : 'dados atualizados';
          return `Cliente ${empresa}: ${changesText} em ${date}`;
        }
        return `Cliente ${empresa} atualizado em ${date}`;
      
      case 'CLIENTE_EXCLUIDO':
        return `Cliente ${empresa} removido do sistema em ${date}`;
      
      default:
        return `Cliente ${empresa}: ${log.event_type} em ${date}`;
    }
  };

  // Função para formatar telefones
  const formatPhones = (telefones: string[]): string => {
    if (!telefones || telefones.length === 0) return '-';
    if (telefones.length === 1) return telefones[0];
    return `${telefones[0]} (+${telefones.length - 1})`;
  };

  // Renderizar estado de loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizar estado de erro
  if (clientsError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie os clientes cadastrados no sistema</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <p className="text-red-500 mb-4">Erro ao carregar clientes. Tente novamente.</p>
              <p className="text-sm text-muted-foreground">{clientsError.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizar estado vazio
  if (clients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie os clientes cadastrados no sistema</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum cliente encontrado</p>
              <p className="text-muted-foreground">Comece cadastrando o primeiro cliente no sistema.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">Gerencie os clientes cadastrados no sistema</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Clientes ({clients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Empresa
                    </div>
                  </TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefones
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      CNPJ
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Criado em
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => {
                  const clientLogsData = logsByClient[client.uuid] || [];
                  const recentLogs = clientLogsData.slice(0, 3);
                  const isExpanded = expandedClients.has(client.uuid);
                  
                  return (
                    <React.Fragment key={client.uuid}>
                      <TableRow className="group">
                        <TableCell>
                          <Collapsible>
                            <CollapsibleTrigger
                              onClick={() => toggleClientExpansion(client.uuid)}
                              className="flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </CollapsibleTrigger>
                          </Collapsible>
                        </TableCell>
                        <TableCell className="font-medium">{client.empresa}</TableCell>
                        <TableCell>{client.responsavel}</TableCell>
                        <TableCell>{client.email || '-'}</TableCell>
                        <TableCell>{formatPhones(client.telefones)}</TableCell>
                        <TableCell>{client.cnpj || '-'}</TableCell>
                        <TableCell>{formatDateForDisplay(client.created_at)}</TableCell>
                      </TableRow>
                      
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/30 p-0">
                            <Collapsible open={isExpanded}>
                              <CollapsibleContent>
                                <div className="p-4 space-y-3">
                                  <h4 className="font-medium text-sm text-muted-foreground mb-3">
                                    Histórico de Alterações
                                  </h4>
                                  
                                  {clientLogsData.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">
                                      Nenhum histórico para este cliente
                                    </p>
                                  ) : (
                                    <div className="space-y-2">
                                      {(isExpanded ? clientLogsData : recentLogs).map((log) => (
                                        <div
                                          key={log.id}
                                          className="text-sm p-3 bg-background rounded border border-border/50"
                                        >
                                          <p className="text-foreground">{formatLogMessage(log)}</p>
                                          {log.performed_by_email && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                              Por: {log.performed_by_email}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                      
                                      {!isExpanded && clientLogsData.length > 3 && (
                                        <p className="text-xs text-muted-foreground text-center pt-2">
                                          +{clientLogsData.length - 3} registro(s) mais antigo(s)
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;
