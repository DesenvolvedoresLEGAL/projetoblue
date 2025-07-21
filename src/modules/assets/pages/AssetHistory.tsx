
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, Search, Calendar, ArrowLeft, ChevronDown, ChevronRight, User, Settings, Database, Link2, Plus, Edit3, Trash2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StandardPageHeader } from '@/components/ui/standard-page-header';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CombinedLogEntry {
  id: number;
  uuid: string;
  logType: 'asset' | 'association';
  user_id: string;
  asset_id?: string;
  association_uuid?: string;
  event: string;
  details: Record<string, unknown>;
  status_before_id?: number | null;
  status_after_id?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Campos derivados para UI
  date: string;
  description: string;
}

const AssetHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logTypeFilter, setLogTypeFilter] = useState<'all' | 'asset' | 'association'>('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const itemsPerPage = 20;
  const navigate = useNavigate();

  // Query para buscar nomes de status
  const { data: statusData = [] } = useQuery({
    queryKey: ['asset-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_status')
        .select('id, status');
      
      if (error) {
        
        return [];
      }
      
      return data || [];
    },
  });

  // Criar mapa de status ID para nome
  const statusMap = statusData.reduce((acc, status) => {
    acc[status.id] = status.status;
    return acc;
  }, {} as Record<number, string>);

  // Query para buscar dados combinados de histórico
  const { data: historyData = [], isLoading, error } = useQuery({
    queryKey: ['asset-history-combined'],
    queryFn: async (): Promise<CombinedLogEntry[]> => {
      // Buscar asset_logs
      const { data: assetLogsData, error: assetLogsError } = await supabase
        .from('asset_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (assetLogsError) {
        
        throw assetLogsError;
      }
      
      // Buscar association_logs
      const { data: associationLogsData, error: associationLogsError } = await supabase
        .from('association_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (associationLogsError) {
        
        throw associationLogsError;
      }
      
      // Transformar asset_logs
      const assetLogs = (assetLogsData || []).map((row: any): CombinedLogEntry => ({
        id: row.uuid ? parseInt(row.uuid.replace(/-/g, '').substring(0, 10), 16) : Date.now(),
        uuid: row.uuid,
        logType: 'asset',
        user_id: row.user_id,
        asset_id: row.asset_id,
        event: row.event || 'Unknown Event',
        details: (row.details as Record<string, unknown>) || {},
        status_before_id: row.status_before_id,
        status_after_id: row.status_after_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at,
        date: row.created_at || new Date().toISOString(),
        description: generateUserFriendlyDescription(row, 'asset'),
      }));
      
      // Transformar association_logs
      const associationLogs = (associationLogsData || []).map((row: any): CombinedLogEntry => ({
        id: row.uuid ? parseInt(row.uuid.replace(/-/g, '').substring(0, 10), 16) : Date.now(),
        uuid: row.uuid,
        logType: 'association',
        user_id: row.user_id,
        association_uuid: row.association_uuid,
        event: row.event || 'Unknown Event',
        details: (row.details as Record<string, unknown>) || {},
        status_before_id: null,
        status_after_id: null,
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at,
        date: row.created_at || new Date().toISOString(),
        description: generateUserFriendlyDescription(row, 'association'),
      }));
      
      // Combinar e ordenar resultados por data
      return [...assetLogs, ...associationLogs].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });

  // Função para traduzir eventos para linguagem amigável
  const translateEvent = (event: string, logType: 'asset' | 'association'): string => {
    const eventTranslations: Record<string, string> = {
      'INSERT': 'Cadastro de Ativo',
      'UPDATE': 'Atualização',
      'DELETE': 'Remoção',
      'ASSET_CRIADO': 'Ativo Criado',
      'STATUS_UPDATED': 'Status Atualizado',
      'SOFT_DELETE': 'Ativo Removido',
      'ASSOCIATION_CREATED': 'Associação Criada',
      'ASSOCIATION_REMOVED': 'Associação Removida',
      'ASSOCIATION_STATUS_UPDATED': 'Status da Associação Atualizado',
    };
    
    return eventTranslations[event] || event;
  };

  // Função para gerar descrição amigável
  const generateUserFriendlyDescription = (row: any, logType: 'asset' | 'association'): string => {
    const details = row.details || {};
    const event = row.event || '';
    
    if (logType === 'asset') {
      const assetId = row.asset_id || 'Ativo';
      const radio = details.radio || details.line_number || assetId;
      
      switch (event) {
        case 'INSERT':
        case 'ASSET_CRIADO':
          return `Ativo ${radio} foi cadastrado no sistema`;
        case 'UPDATE':
          return `Dados do ativo ${radio} foram atualizados`;
        case 'STATUS_UPDATED':
          return `Status do ativo ${radio} foi alterado`;
        case 'DELETE':
        case 'SOFT_DELETE':
          return `Ativo ${radio} foi removido do sistema`;
        default:
          return `Evento registrado para o ativo ${radio}`;
      }
    } else {
      const associationId = row.association_uuid || 'Associação';
      const shortId = associationId.substring(0, 8);
      
      switch (event) {
        case 'INSERT':
        case 'ASSOCIATION_CREATED':
          return `Nova associação ${shortId} foi criada`;
        case 'UPDATE':
          return `Associação ${shortId} foi atualizada`;
        case 'DELETE':
        case 'ASSOCIATION_REMOVED':
          return `Associação ${shortId} foi removida`;
        default:
          return `Evento registrado para a associação ${shortId}`;
      }
    }
  };

  // Função para obter ícone do evento
  const getEventIcon = (event: string) => {
    if (event.includes('INSERT') || event.includes('CRIADO') || event.includes('CREATED')) {
      return <Plus className="h-4 w-4" />;
    }
    if (event.includes('UPDATE') || event.includes('STATUS')) {
      return <Edit3 className="h-4 w-4" />;
    }
    if (event.includes('DELETE') || event.includes('REMOVED')) {
      return <Trash2 className="h-4 w-4" />;
    }
    if (event.includes('ASSOCIATION')) {
      return <Link2 className="h-4 w-4" />;
    }
    return <Settings className="h-4 w-4" />;
  };

  // Função para obter variante do badge do evento
  const getEventBadgeVariant = (event: string | undefined) => {
    if (!event) return 'outline';
    
    if (event.includes('INSERT') || event.includes('CRIADO') || event.includes('CREATED')) {
      return 'success';
    }
    if (event.includes('UPDATE') || event.includes('STATUS')) {
      return 'default';
    }
    if (event.includes('DELETE') || event.includes('REMOVED')) {
      return 'destructive';
    }
    if (event.includes('ASSOCIATION')) {
      return 'secondary';
    }
    return 'outline';
  };

  // Filtrar e paginar dados
  const filteredData = historyData.filter((entry) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      entry.event?.toLowerCase().includes(searchLower) ||
      entry.description?.toLowerCase().includes(searchLower) ||
      entry.id.toString().includes(searchLower) ||
      (entry.asset_id && entry.asset_id.toLowerCase().includes(searchLower)) ||
      (entry.association_uuid && entry.association_uuid.toLowerCase().includes(searchLower));
    
    const matchesType = 
      logTypeFilter === 'all' || 
      entry.logType === logTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Não informado';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const toggleRowExpanded = (uuid: string) => {
    setExpandedRowId(prevId => prevId === uuid ? null : uuid);
  };

  const formatUuid = (uuid: string): string => {
    return uuid.substring(0, 8) + '...';
  };

  const getStatusName = (statusId: number | null | undefined): string => {
    if (!statusId) return 'Não informado';
    return statusMap[statusId] || `Status ${statusId}`;
  };

  const ExpandedDetails = ({ entry }: { entry: CombinedLogEntry }) => {
    return (
      <div className="p-4 bg-muted/30 rounded-md">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Database className="h-4 w-4" />
          Detalhes Técnicos
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Identificador:</p>
              <p className="font-mono text-xs bg-background p-2 rounded border">
                {entry.uuid}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Tipo de Registro:</p>
              <Badge variant={entry.logType === 'asset' ? 'default' : 'secondary'} className="mt-1">
                {entry.logType === 'asset' ? 'Registro de Ativo' : 'Registro de Associação'}
              </Badge>
            </div>
            {entry.logType === 'asset' && entry.asset_id && (
              <div>
                <p className="text-sm text-muted-foreground font-medium">ID do Ativo:</p>
                <p className="font-mono text-xs bg-background p-2 rounded border">
                  {entry.asset_id}
                </p>
              </div>
            )}
            {entry.logType === 'association' && entry.association_uuid && (
              <div>
                <p className="text-sm text-muted-foreground font-medium">ID da Associação:</p>
                <p className="font-mono text-xs bg-background p-2 rounded border">
                  {entry.association_uuid}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Usuário Responsável:</p>
              <p className="font-mono text-xs bg-background p-2 rounded border">
                {entry.user_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Data de Criação:</p>
              <p className="text-xs bg-background p-2 rounded border">
                {formatDate(entry.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Última Atualização:</p>
              <p className="text-xs bg-background p-2 rounded border">
                {formatDate(entry.updated_at)}
              </p>
            </div>
          </div>
          <div className="col-span-1 md:col-span-2">
            <p className="text-sm text-muted-foreground font-medium mb-2">Informações Detalhadas:</p>
            <pre className="bg-background p-3 rounded border text-xs overflow-x-auto max-h-40 whitespace-pre-wrap">
              {JSON.stringify(entry.details, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="space-y-6">
          <StandardPageHeader
            icon={History}
            title="Histórico de Alterações"
            description="Carregando registros de atividades..."
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 p-0 hover:bg-legal-primary/10 hover:text-legal-primary dark:hover:bg-legal-secondary/10 dark:hover:text-legal-secondary transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </StandardPageHeader>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-primary mb-4"></div>
                <p className="text-center text-muted-foreground mb-2">
                  Buscando registros de atividades...
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  Consultando histórico de ativos e associações
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    );
  }

  if (error) {
    return (
      <TooltipProvider>
        <div className="space-y-6">
          <StandardPageHeader
            icon={History}
            title="Histórico de Alterações"
            description="Erro ao carregar dados"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 p-0 hover:bg-legal-primary/10 hover:text-legal-primary dark:hover:bg-legal-secondary/10 dark:hover:text-legal-secondary transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </StandardPageHeader>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-destructive text-4xl mb-4">⚠️</div>
                <p className="text-destructive font-medium mb-2">
                  Não foi possível carregar o histórico
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Ocorreu um erro ao buscar os registros de atividades. Tente novamente em alguns instantes.
                </p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <StandardPageHeader
          icon={History}
          title="Histórico de Alterações"
          description="Registro completo de atividades e movimentações do sistema"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 p-0 hover:bg-legal-primary/10 hover:text-legal-primary dark:hover:bg-legal-secondary/10 dark:hover:text-legal-secondary transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </StandardPageHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Registro de Atividades ({filteredData.length} {filteredData.length === 1 ? 'registro' : 'registros'})
            </CardTitle>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por evento, descrição ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <Button 
                      variant={logTypeFilter === 'all' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setLogTypeFilter('all')}
                    >
                      Todos os Registros
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exibir todos os tipos de registros</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger>
                    <Button 
                      variant={logTypeFilter === 'asset' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setLogTypeFilter('asset')}
                    >
                      Registros de Ativos
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exibir apenas atividades relacionadas a ativos</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger>
                    <Button 
                      variant={logTypeFilter === 'association' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setLogTypeFilter('association')}
                    >
                      Registros de Associações
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exibir apenas atividades relacionadas a associações</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
                      <Tooltip>
                        <TooltipTrigger>
                          <span>Expandir</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Clique para ver detalhes técnicos</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Data e Hora
                      </div>
                    </TableHead>
                    <TableHead>Atividade</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Informações Adicionais</TableHead>
                    <TableHead>
                      {logTypeFilter === 'association' ? 'ID da Associação' : 
                       logTypeFilter === 'asset' ? 'Mudança de Status' : 
                       'Status/Associação'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((entry) => (
                      <React.Fragment key={entry.uuid}>
                        <TableRow 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleRowExpanded(entry.uuid)}
                        >
                          <TableCell>
                            {expandedRowId === entry.uuid ? (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            <Tooltip>
                              <TooltipTrigger>
                                #{entry.id}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-mono text-xs">UUID: {entry.uuid}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Badge variant={entry.logType === 'asset' ? 'default' : 'secondary'}>
                              <div className="flex items-center gap-1">
                                {entry.logType === 'asset' ? <Settings className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
                                {entry.logType === 'asset' ? 'Ativo' : 'Associação'}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{formatDate(entry.date)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getEventBadgeVariant(entry.event)}>
                              <div className="flex items-center gap-1">
                                {getEventIcon(entry.event)}
                                {translateEvent(entry.event, entry.logType)}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <Tooltip>
                                <TooltipTrigger>
                                  <p className="text-sm truncate">
                                    {entry.description || 'Nenhuma descrição disponível'}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-sm">{entry.description || 'Nenhuma descrição disponível'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <Tooltip>
                                <TooltipTrigger>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {Object.keys(entry.details || {}).length > 0 
                                      ? `${Object.keys(entry.details).length} campos adicionais` 
                                      : 'Sem informações extras'}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Clique na linha para ver detalhes completos</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                          <TableCell>
                            {entry.logType === 'asset' ? (
                              <div className="space-y-1">
                                {(entry.status_before_id || entry.status_after_id) ? (
                                  <>
                                    {entry.status_before_id && (
                                      <div className="text-xs text-muted-foreground">
                                        De: <span className="font-medium">{getStatusName(entry.status_before_id)}</span>
                                      </div>
                                    )}
                                    {entry.status_after_id && (
                                      <div className="text-xs">
                                        Para: <span className="font-medium">{getStatusName(entry.status_after_id)}</span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Status não alterado</span>
                                )}
                              </div>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="font-mono text-xs truncate max-w-32">
                                    {entry.association_uuid ? formatUuid(entry.association_uuid) : 'N/A'}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-mono text-xs">
                                    {entry.association_uuid || 'ID não disponível'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                        {expandedRowId === entry.uuid && (
                          <TableRow>
                            <TableCell colSpan={8} className="p-0 border-t-0">
                              <ExpandedDetails entry={entry} />
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="space-y-3">
                          <div className="text-4xl">📋</div>
                          <div>
                            <p className="text-legal-primary dark:text-legal-secondary font-medium">
                              {search || logTypeFilter !== "all"
                                ? "Nenhum registro encontrado com os filtros aplicados"
                                : "Nenhum registro de atividade encontrado"
                              }
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {search || logTypeFilter !== "all"
                                ? "Tente ajustar os filtros de busca ou limpar os campos"
                                : "Os registros aparecerão aqui conforme as atividades acontecem no sistema"
                              }
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredData.length)} de {filteredData.length} registros
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default AssetHistory;
