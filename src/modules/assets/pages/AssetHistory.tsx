
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, Search, Calendar, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StandardPageHeader } from '@/components/ui/standard-page-header';
import { useNavigate } from 'react-router-dom';

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

  // Query to fetch combined history data
  const { data: historyData = [], isLoading, error } = useQuery({
    queryKey: ['asset-history-combined'],
    queryFn: async (): Promise<CombinedLogEntry[]> => {
      // Buscar asset_logs
      const { data: assetLogsData, error: assetLogsError } = await supabase
        .from('asset_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (assetLogsError) {
        if (import.meta.env.DEV) console.error('Error fetching asset logs:', assetLogsError);
        throw assetLogsError;
      }
      
      // Buscar association_logs
      const { data: associationLogsData, error: associationLogsError } = await supabase
        .from('association_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (associationLogsError) {
        if (import.meta.env.DEV) console.error('Error fetching association logs:', associationLogsError);
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
        description: row.details?.description?.toString() || row.event || 'Sem descrição',
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
        description: row.details?.description?.toString() || row.event || 'Sem descrição',
      }));
      
      // Combinar e ordenar resultados por data
      return [...assetLogs, ...associationLogs].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });

  // Filter and paginate data
  const filteredData = historyData.filter((entry) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      entry.event?.toLowerCase().includes(searchLower) ||
      entry.description?.toLowerCase().includes(searchLower) ||
      entry.id.toString().includes(searchLower);
    
    const matchesType = 
      logTypeFilter === 'all' || 
      entry.logType === logTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventBadgeVariant = (event: string | undefined) => {
    switch (event?.toLowerCase()) {
      case 'insert':
      case 'created':
      case 'criado':
        return 'default';
      case 'update':
      case 'updated':
      case 'atualizado':
        return 'secondary';
      case 'delete':
      case 'deleted':
      case 'excluído':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const toggleRowExpanded = (uuid: string) => {
    setExpandedRowId(prevId => prevId === uuid ? null : uuid);
  };

  const ExpandedDetails = ({ entry }: { entry: CombinedLogEntry }) => {
    return (
      <div className="p-4 bg-muted/30 rounded-md">
        <h4 className="font-medium mb-2">Detalhes completos</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">UUID:</p>
            <p className="font-mono text-xs">{entry.uuid}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Usuário ID:</p>
            <p className="font-mono text-xs">{entry.user_id}</p>
          </div>
          {entry.logType === 'asset' && (
            <div>
              <p className="text-sm text-muted-foreground">Asset ID:</p>
              <p className="font-mono text-xs">{entry.asset_id}</p>
            </div>
          )}
          {entry.logType === 'association' && (
            <div>
              <p className="text-sm text-muted-foreground">Association UUID:</p>
              <p className="font-mono text-xs">{entry.association_uuid}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Data de criação:</p>
            <p className="text-xs">{formatDate(entry.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Última atualização:</p>
            <p className="text-xs">{formatDate(entry.updated_at)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Detalhes JSON:</p>
            <pre className="bg-background p-2 rounded text-xs overflow-x-auto mt-1 max-h-40">
              {JSON.stringify(entry.details, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-primary mx-auto mb-4"></div>
          <p>Carregando histórico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-red-600">
          <p>Erro ao carregar histórico de ativos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={History}
        title="Histórico de Alterações"
        description="Histórico de movimentações de ativos e associações"
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
            Registro de Atividades ({filteredData.length})
          </CardTitle>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por evento, ID ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={logTypeFilter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLogTypeFilter('all')}
              >
                Todos
              </Button>
              <Button 
                variant={logTypeFilter === 'asset' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLogTypeFilter('asset')}
              >
                Ativos
              </Button>
              <Button 
                variant={logTypeFilter === 'association' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLogTypeFilter('association')}
              >
                Associações
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>
                    {logTypeFilter === 'association' ? 'Associação' : 
                     logTypeFilter === 'asset' ? 'Status (Antes/Depois)' : 
                     'Status/Associação'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((entry) => (
                    <React.Fragment key={entry.uuid}>
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50"
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
                          #{entry.id}
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.logType === 'asset' ? 'default' : 'secondary'}>
                            {entry.logType === 'asset' ? 'Ativo' : 'Associação'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(entry.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEventBadgeVariant(entry.event)}>
                            {entry.event || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {entry.description || 'Sem descrição'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {Object.keys(entry.details || {}).length > 0 
                              ? JSON.stringify(entry.details).substring(0, 50) + '...' 
                              : 'Sem detalhes'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.logType === 'asset' ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-500">Antes: {entry.status_before_id || 'N/A'}</span>
                              <span className="text-xs">Depois: {entry.status_after_id || 'N/A'}</span>
                            </div>
                          ) : (
                            <div className="font-mono text-xs truncate max-w-32">
                              {entry.association_uuid || 'N/A'}
                            </div>
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
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhum registro encontrado
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
  );
};

export default AssetHistory;
