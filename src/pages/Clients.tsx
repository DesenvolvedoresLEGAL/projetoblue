import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Calendar, 
  Mail, 
  Phone, 
  Building, 
  Hash, 
  Eye,
  Edit, 
  Trash2, 
  X, 
  Plus,
  MoreVertical,
  FileUser,
  Download,
  Search
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateForDisplay, formatDateTimeForDisplay } from '@/utils/dateUtils';
import { toast } from 'sonner';

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
  details: any;
  old_data?: any;
  new_data?: any;
  date: string;
  performed_by_email?: string;
}

interface EditClientFormData {
  empresa: string;
  responsavel: string;
  telefones: string[];
  email: string;
  cnpj: string;
}

const Clients = () => {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const queryClient = useQueryClient();

  // Form state for editing
  const [editFormData, setEditFormData] = useState<EditClientFormData>({
    empresa: '',
    responsavel: '',
    telefones: [''],
    email: '',
    cnpj: ''
  });

  // Buscar todos os clientes (apenas não deletados)
  const { data: clients = [], isLoading: clientsLoading, error: clientsError } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('uuid, empresa, responsavel, telefones, cnpj, email, created_at, updated_at, deleted_at')
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

  // Filter clients based on search term and status
  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' || 
      client.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telefones?.some(tel => tel.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !client.deleted_at) ||
      (statusFilter === 'inactive' && !!client.deleted_at);
    
    return matchesSearch && matchesStatus;
  });

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

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

  // Função para abrir modal de edição
  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setEditFormData({
      empresa: client.empresa,
      responsavel: client.responsavel,
      telefones: client.telefones.length > 0 ? client.telefones : [''],
      email: client.email || '',
      cnpj: client.cnpj || ''
    });
    setIsEditModalOpen(true);
  };

  // Função para fechar modal de edição
  const closeEditModal = () => {
    setSelectedClient(null);
    setIsEditModalOpen(false);
    setEditFormData({
      empresa: '',
      responsavel: '',
      telefones: [''],
      email: '',
      cnpj: ''
    });
  };

  // Função para adicionar novo telefone
  const addTelefone = () => {
    if (editFormData.telefones.length < 5) {
      setEditFormData(prev => ({
        ...prev,
        telefones: [...prev.telefones, '']
      }));
    }
  };

  // Função para remover telefone
  const removeTelefone = (index: number) => {
    if (editFormData.telefones.length > 1) {
      setEditFormData(prev => ({
        ...prev,
        telefones: prev.telefones.filter((_, i) => i !== index)
      }));
    }
  };

  // Função para atualizar telefone
  const updateTelefone = (index: number, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      telefones: prev.telefones.map((tel, i) => i === index ? value : tel)
    }));
  };

  // Função para atualizar cliente
  const handleUpdateClient = async () => {
    if (!selectedClient) return;

    // Validações
    if (!editFormData.empresa.trim()) {
      toast.error("O campo empresa é obrigatório.");
      return;
    }

    if (!editFormData.responsavel.trim()) {
      toast.error("O campo responsável é obrigatório.");
      return;
    }

    const telefonesFiltrados = editFormData.telefones.filter(tel => tel.trim());
    if (telefonesFiltrados.length === 0) {
      toast.error("Pelo menos um telefone deve ser informado.");
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          empresa: editFormData.empresa.trim(),
          responsavel: editFormData.responsavel.trim(),
          telefones: telefonesFiltrados,
          email: editFormData.email.trim() || null,
          cnpj: editFormData.cnpj.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('uuid', selectedClient.uuid);

      if (error) throw error;

      toast.success("Cliente atualizado com sucesso.");

      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-logs'] });
      closeEditModal();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error("Erro ao atualizar cliente. Tente novamente.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para soft delete
  const handleSoftDelete = async (clientUuid: string) => {
    const client = clients.find(c => c.uuid === clientUuid);
    if (!client) return;

    if (!window.confirm(`Tem certeza que deseja excluir o cliente "${client.empresa}"?`)) {
      return;
    }

    setIsDeleting(clientUuid);

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
      console.error('Erro ao excluir cliente:', error);
      toast.error("Erro ao excluir cliente. Tente novamente.");
    } finally {
      setIsDeleting(null);
    }
  };

  // Renderizar estado de loading
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        {/* Filters Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>

        {/* Table Skeleton */}
        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <CardContent className="p-0">
            <div className="space-y-4 p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#020CBC]">Clientes</h1>
        </div>
        
        <Card className="border border-red-200 rounded-lg">
          <CardContent className="p-6">
            <div className="text-center py-10">
              <p className="text-red-600 mb-4 font-medium">Erro ao carregar clientes. Tente novamente.</p>
              <p className="text-sm text-gray-600">{clientsError.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
      {/* Header com identidade LEGAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="p-2 bg-[#4D2BFB]/10 rounded-lg">
            <FileUser className="h-6 w-6 text-[#4D2BFB]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#020CBC]">Clientes</h1>
            <p className="text-sm text-gray-600">Gerencie os clientes cadastrados no sistema</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="bg-[#4D2BFB] text-white hover:bg-[#3a1ecc] focus:ring-[#4D2BFB] flex items-center gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
          <Button 
            variant="outline" 
            className="border-[#03F9FF] text-[#020CBC] hover:bg-[#03F9FF]/10 focus:ring-[#03F9FF] flex items-center gap-2 w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label htmlFor="search" className="text-sm font-medium text-[#020CBC]">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Empresa, responsável, telefone..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="statusFilter" className="text-sm font-medium text-[#020CBC]">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="lg:col-span-2 flex items-end gap-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                Limpar
              </Button>
              <Button
                className="bg-[#4D2BFB] text-white hover:bg-[#3a1ecc] w-full sm:w-auto flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {filteredClients.length === 0 ? (
        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <CardContent className="p-6">
            <div className="text-center py-10">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2 text-gray-700">Nenhum cliente encontrado</p>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros ou criar um novo cliente.'
                  : 'Comece cadastrando o primeiro cliente no sistema.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-200 rounded-lg shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-gray-50/50">
            <CardTitle className="flex items-center gap-2 text-[#020CBC]">
              <Users className="h-5 w-5" />
              Lista de Clientes ({filteredClients.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="px-4 py-3 text-sm font-medium text-[#020CBC]">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Empresa
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-sm font-medium text-[#020CBC]">Responsável</TableHead>
                    <TableHead className="px-4 py-3 text-sm font-medium text-[#020CBC] hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-sm font-medium text-[#020CBC]">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Telefones
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-sm font-medium text-[#020CBC] hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        CNPJ
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-sm font-medium text-[#020CBC] hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Criado em
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-sm font-medium text-[#020CBC]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
                    const clientLogsData = logsByClient[client.uuid] || [];
                    const isExpanded = expandedClients.has(client.uuid);
                    
                    return (
                      <React.Fragment key={client.uuid}>
                        <TableRow className="hover:bg-gray-50 border-b border-gray-100">
                          <TableCell className="px-4 py-3">
                            <Collapsible>
                              <CollapsibleTrigger
                                onClick={() => toggleClientExpansion(client.uuid)}
                                className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-[#020CBC]" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-[#020CBC]" />
                                )}
                              </CollapsibleTrigger>
                            </Collapsible>
                          </TableCell>
                          <TableCell className="px-4 py-3 font-medium text-gray-900">{client.empresa}</TableCell>
                          <TableCell className="px-4 py-3 text-gray-700">{client.responsavel}</TableCell>
                          <TableCell className="px-4 py-3 text-gray-700 hidden sm:table-cell">{client.email || '-'}</TableCell>
                          <TableCell className="px-4 py-3 text-gray-700">{formatPhones(client.telefones)}</TableCell>
                          <TableCell className="px-4 py-3 text-gray-700 hidden md:table-cell">{client.cnpj || '-'}</TableCell>
                          <TableCell className="px-4 py-3 text-gray-700 hidden lg:table-cell">{formatDateForDisplay(client.created_at)}</TableCell>
                          <TableCell className="px-4 py-3">
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
                              <DropdownMenuContent align="end" sideOffset={4} className="w-36">
                                <DropdownMenuItem onClick={() => openEditModal(client)}>
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
                          </TableCell>
                        </TableRow>
                        
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-gray-50/30 p-0 border-b border-gray-100">
                              <Collapsible open={isExpanded}>
                                <CollapsibleContent>
                                  <div className="p-4 space-y-3">
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
      )}

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-full max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#020CBC]">Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente. Campos obrigatórios estão marcados com *.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="empresa" className="text-sm font-medium text-[#020CBC]">Empresa *</Label>
                <Input
                  id="empresa"
                  value={editFormData.empresa}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, empresa: e.target.value }))}
                  placeholder="Nome da empresa"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="responsavel" className="text-sm font-medium text-[#020CBC]">Responsável *</Label>
                <Input
                  id="responsavel"
                  value={editFormData.responsavel}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                  placeholder="Nome do responsável"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-[#020CBC]">Telefones *</Label>
              {editFormData.telefones.map((telefone, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={telefone}
                    onChange={(e) => updateTelefone(index, e.target.value)}
                    placeholder="(XX) XXXXX-XXXX"
                    className="flex-1"
                    required={index === 0}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTelefone(index)}
                    disabled={editFormData.telefones.length === 1}
                    className="px-3"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTelefone}
                disabled={editFormData.telefones.length >= 5}
                className="w-full mt-2 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Telefone
              </Button>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium text-[#020CBC]">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="exemplo@empresa.com"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cnpj" className="text-sm font-medium text-[#020CBC]">CNPJ</Label>
              <Input
                id="cnpj"
                value={editFormData.cnpj}
                onChange={(e) => setEditFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={closeEditModal}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateClient}
              disabled={isUpdating}
              className="bg-[#4D2BFB] text-white hover:bg-[#3a1ecc]"
            >
              {isUpdating ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
