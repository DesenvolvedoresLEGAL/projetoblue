
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Calendar, 
  Mail, 
  Phone, 
  Building, 
  Hash,
  Edit, 
  Trash2,
  MoreVertical
} from 'lucide-react';
import { formatDateForDisplay, formatDateTimeForDisplay } from '@/utils/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface Client {
  uuid: string;
  empresa: string;
  responsavel: string;
  telefones: string[];
  cnpj?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface ClientLog {
  id: string;
  client_id: string;
  event_type: string;
  details: Record<string, unknown>;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  date: string;
  performed_by_email?: string;
}

interface ClientsTableProps {
  clients: Client[];
  clientLogs: ClientLog[];
  expandedClients: Set<string>;
  onToggleExpansion: (clientId: string) => void;
  onEditClient: (client: Client) => void;
  isUpdating: boolean;
  isDeleting: string | null;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  clientLogs,
  expandedClients,
  onToggleExpansion,
  onEditClient,
  isUpdating,
  isDeleting
}) => {
  const queryClient = useQueryClient();

  // Agrupar logs por cliente
  const logsByClient = clientLogs.reduce((acc, log) => {
    if (!acc[log.client_id]) acc[log.client_id] = [];
    acc[log.client_id].push(log);
    return acc;
  }, {} as Record<string, ClientLog[]>);

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

  // Função para soft delete
  const handleSoftDelete = async (clientUuid: string) => {
    const client = clients.find(c => c.uuid === clientUuid);
    if (!client) return;

    if (!window.confirm(`Tem certeza que deseja excluir o cliente "${client.empresa}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          deleted_at: new Date().toISOString() 
        })
        .eq('uuid', clientUuid);

      if (error) throw error;

      toast.success("Cliente excluído com sucesso.");

      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-logs'] });
    } catch (error) {
      
      toast.error("Erro ao excluir cliente. Tente novamente.");
    }
  };

  return (
    <Card className="border border-gray-200 rounded-lg shadow-sm">
      <CardHeader className="border-b border-gray-200 bg-gray-50/50 p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-[#020CBC] text-lg sm:text-xl">
          <Users className="h-5 w-5 sm:h-6 sm:w-6" />
          Lista de Clientes ({clients.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile Card View (< 640px) */}
        <div className="block sm:hidden space-y-3 p-3">
          {clients.map((client) => {
            const clientLogsData = logsByClient[client.uuid] || [];
            const isExpanded = expandedClients.has(client.uuid);
            
            return (
              <div key={client.uuid} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-[#020CBC] text-base mb-1">{client.empresa}</h3>
                    <p className="text-sm text-gray-600">{client.responsavel}</p>
                  </div>
                  <RoleGuard requiredRole="suporte">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="p-2 h-8 w-8 hover:bg-gray-100"
                          disabled={isUpdating || isDeleting === client.uuid}
                        >
                          <MoreVertical className="h-4 w-4 text-[#020CBC]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={4} className="w-36 bg-white border border-gray-200 shadow-lg z-50">
                        <DropdownMenuItem onClick={() => onEditClient(client)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleSoftDelete(client.uuid)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </RoleGuard>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{formatPhones(client.telefones)}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{client.email}</span>
                    </div>
                  )}
                  {client.cnpj && (
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{client.cnpj}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{formatDateForDisplay(client.created_at)}</span>
                  </div>
                </div>

                {/* Expand/Collapse button for mobile */}
                <Collapsible>
                  <CollapsibleTrigger
                    onClick={() => onToggleExpansion(client.uuid)}
                    className="flex items-center gap-2 mt-3 text-sm text-[#020CBC] hover:text-[#3a1ecc]"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    Ver histórico
                  </CollapsibleTrigger>
                  {isExpanded && (
                    <CollapsibleContent>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <h4 className="font-medium text-sm text-[#020CBC] mb-2">
                          Histórico de Alterações
                        </h4>
                        
                        {clientLogsData.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">
                            Nenhum histórico para este cliente
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {clientLogsData.slice(0, 3).map((log) => (
                              <div
                                key={log.id}
                                className="text-sm p-2 bg-gray-50 rounded border"
                              >
                                <p className="text-gray-700">{formatLogMessage(log)}</p>
                                {log.performed_by_email && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Por: {log.performed_by_email}
                                  </p>
                                )}
                              </div>
                            ))}
                            
                            {clientLogsData.length > 3 && (
                              <p className="text-xs text-gray-500 text-center pt-1">
                                +{clientLogsData.length - 3} registro(s) mais antigo(s)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View (≥ 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-[50px] px-2 sm:px-4"></TableHead>
                <TableHead className="px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Empresa
                  </div>
                </TableHead>
                <TableHead className="px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">Responsável</TableHead>
                <TableHead className="hidden md:table-cell px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </TableHead>
                <TableHead className="px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefones
                  </div>
                </TableHead>
                <TableHead className="hidden lg:table-cell px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    CNPJ
                  </div>
                </TableHead>
                <TableHead className="hidden xl:table-cell px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Criado em
                  </div>
                </TableHead>
                <TableHead className="px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => {
                const clientLogsData = logsByClient[client.uuid] || [];
                const isExpanded = expandedClients.has(client.uuid);
                
                return (
                  <React.Fragment key={client.uuid}>
                    <TableRow className="hover:bg-gray-50 border-b border-gray-100">
                      <TableCell className="px-2 sm:px-4 py-3">
                        <Collapsible>
                          <CollapsibleTrigger
                            onClick={() => onToggleExpansion(client.uuid)}
                            className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded hover:bg-gray-100 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-[#020CBC]" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-[#020CBC]" />
                            )}
                          </CollapsibleTrigger>
                        </Collapsible>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-3 font-medium text-gray-900 text-sm">{client.empresa}</TableCell>
                      <TableCell className="px-2 sm:px-4 py-3 text-gray-700 text-sm">{client.responsavel}</TableCell>
                      <TableCell className="hidden md:table-cell px-2 sm:px-4 py-3 text-gray-700 text-sm">{client.email || '-'}</TableCell>
                      <TableCell className="px-2 sm:px-4 py-3 text-gray-700 text-sm">{formatPhones(client.telefones)}</TableCell>
                      <TableCell className="hidden lg:table-cell px-2 sm:px-4 py-3 text-gray-700 text-sm">{client.cnpj || '-'}</TableCell>
                      <TableCell className="hidden xl:table-cell px-2 sm:px-4 py-3 text-gray-700 text-sm">{formatDateForDisplay(client.created_at)}</TableCell>
                      <TableCell className="px-2 sm:px-4 py-3">
                        <RoleGuard requiredRole="suporte">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="p-1 sm:p-2 h-6 w-6 sm:h-8 sm:w-8 hover:bg-gray-100"
                                disabled={isUpdating || isDeleting === client.uuid}
                              >
                                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4 text-[#020CBC]" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={4} className="w-36 bg-white border border-gray-200 shadow-lg z-50">
                              <DropdownMenuItem onClick={() => onEditClient(client)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSoftDelete(client.uuid)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </RoleGuard>
                      </TableCell>
                    </TableRow>
                    
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-gray-50/30 p-0 border-b border-gray-100">
                          <Collapsible open={isExpanded}>
                            <CollapsibleContent>
                              <div className="p-3 sm:p-4 space-y-3">
                                <h4 className="font-medium text-sm text-[#020CBC] mb-3">
                                  Histórico de Alterações
                                </h4>
                                
                                {clientLogsData.length === 0 ? (
                                  <p className="text-sm text-gray-500 italic">
                                    Nenhum histórico para este cliente
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {clientLogsData.slice(0, 3).map((log) => (
                                      <div
                                        key={log.id}
                                        className="text-sm p-3 bg-white rounded border border-gray-200"
                                      >
                                        <p className="text-gray-700">{formatLogMessage(log)}</p>
                                        {log.performed_by_email && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Por: {log.performed_by_email}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                    
                                    {clientLogsData.length > 3 && (
                                      <p className="text-xs text-gray-500 text-center pt-2">
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
  );
};
