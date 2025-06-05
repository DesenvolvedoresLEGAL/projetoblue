import React, { useState, useMemo } from 'react';
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { StandardFiltersCard } from "@/components/ui/standard-filters-card";
import { StandardStatusBadge } from "@/components/ui/standard-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { History, RefreshCw, Calendar, User, Settings, Edit } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoryFilters {
  search: string;
  eventType: string;
  dateFrom: string;
  dateTo: string;
}

const AssetHistory = () => {
  const [filters, setFilters] = useState<HistoryFilters>({
    search: '',
    eventType: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Buscar logs de ativos
  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['asset-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('asset_logs')
        .select(`
          *
        `)
        .order('date', { ascending: false })
        .limit(100);

      // Aplicar filtros
      if (filters.search.trim()) {
        // Buscar em detalhes JSON
        query = query.or(
          `event.ilike.%${filters.search}%,` +
          `details->>line_number.ilike.%${filters.search}%,` +
          `details->>radio.ilike.%${filters.search}%`
        );
      }

      if (filters.eventType && filters.eventType !== 'all') {
        query = query.eq('event', filters.eventType);
      }

      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo + 'T23:59:59');
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar logs:', error);
        throw error;
      }

      return data || [];
    }
  });

  // Buscar tipos de eventos únicos
  const { data: eventTypes = [] } = useQuery({
    queryKey: ['event-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_logs')
        .select('event')
        .not('event', 'is', null);

      if (error) throw error;

      const uniqueEvents = [...new Set(data?.map(log => log.event) || [])];
      return uniqueEvents.sort();
    }
  });

  const handleFilterChange = (key: keyof HistoryFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      eventType: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  const formatEvent = (event: string) => {
    const eventMap: Record<string, string> = {
      'ASSET_CRIADO': 'Ativo Criado',
      'STATUS_UPDATED': 'Status Atualizado',
      'ASSOCIATION_CREATED': 'Associação Criada',
      'ASSOCIATION_REMOVED': 'Associação Removida',
      'ASSOCIATION_STATUS_UPDATED': 'Status da Associação Atualizado',
      'INCONSISTENCY_CORRECTED': 'Inconsistência Corrigida',
      'ASSET_SOFT_DELETE': 'Ativo Removido'
    };
    return eventMap[event] || event;
  };

  const getAssetIdentifier = (details: any) => {
    if (!details || typeof details !== 'object') return 'N/A';
    
    if (details.line_number) {
      return `Linha: ${details.line_number}`;
    }
    if (details.radio) {
      return `Rádio: ${details.radio}`;
    }
    if (details.asset_id) {
      return `ID: ${details.asset_id.substring(0, 8)}...`;
    }
    return 'N/A';
  };

  const getUserInfo = (details: any) => {
    if (!details || typeof details !== 'object') return 'Sistema';
    
    if (details.username && details.username !== 'system') {
      return details.username;
    }
    return 'Sistema';
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'STATUS_UPDATED':
      case 'ASSOCIATION_STATUS_UPDATED':
        return <Edit className="h-3 w-3" />;
      case 'ASSET_CRIADO':
        return <Calendar className="h-3 w-3" />;
      default:
        return <Settings className="h-3 w-3" />;
    }
  };

  const filteredLogs = useMemo(() => {
    return logs;
  }, [logs]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StandardPageHeader
          icon={History}
          title="Histórico de Ativos"
          description="Auditoria e rastreabilidade completa de todas as operações do sistema"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#4D2BFB]" />
            <p className="text-muted-foreground font-neue-haas">Carregando histórico...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={History}
        title="Histórico de Ativos"
        description="Auditoria e rastreabilidade completa de todas as operações do sistema"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-2 border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB] hover:text-white font-neue-haas"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </StandardPageHeader>

      <StandardFiltersCard title="Buscar e Filtrar Histórico">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca geral */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">Buscar</Label>
            <Input
              id="search"
              placeholder="Buscar por rádio, linha ou evento..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="h-10"
            />
          </div>

          {/* Tipo de evento */}
          <div className="space-y-2">
            <Label htmlFor="event-type" className="text-sm font-medium">Tipo de Evento</Label>
            <Select
              value={filters.eventType}
              onValueChange={(value) => handleFilterChange('eventType', value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Todos os eventos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os eventos</SelectItem>
                {eventTypes.map((eventType) => (
                  <SelectItem key={eventType} value={eventType}>
                    {formatEvent(eventType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data inicial */}
          <div className="space-y-2">
            <Label htmlFor="date-from" className="text-sm font-medium">Data Inicial</Label>
            <Input
              id="date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="h-10"
            />
          </div>

          {/* Data final */}
          <div className="space-y-2">
            <Label htmlFor="date-to" className="text-sm font-medium">Data Final</Label>
            <Input
              id="date-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        {/* Botão para limpar filtros */}
        <div className="flex justify-end mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-[#4D2BFB] hover:bg-[#4D2BFB]/10 font-neue-haas"
          >
            Limpar Filtros
          </Button>
        </div>
      </StandardFiltersCard>

      <Card className="border-[#4D2BFB]/20 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#4D2BFB]/20 bg-[#F0F3FF]">
                  <TableHead className="font-neue-haas text-[#020CBC] font-semibold">Data/Hora</TableHead>
                  <TableHead className="font-neue-haas text-[#020CBC] font-semibold">Evento</TableHead>
                  <TableHead className="font-neue-haas text-[#020CBC] font-semibold">Ativo</TableHead>
                  <TableHead className="font-neue-haas text-[#020CBC] font-semibold">Usuário</TableHead>
                  <TableHead className="font-neue-haas text-[#020CBC] font-semibold">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-[#4D2BFB]/10 hover:bg-[#4D2BFB]/5 transition-colors">
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="font-medium font-neue-haas text-[#020CBC]">
                            {new Date(log.date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.date).toLocaleTimeString('pt-BR')}
                          </div>
                          <div className="text-xs text-[#03F9FF] font-medium">
                            {formatDistanceToNow(new Date(log.date), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-[#03F9FF]/20 rounded">
                            {getEventIcon(log.event)}
                          </div>
                          <StandardStatusBadge 
                            status={formatEvent(log.event)} 
                            type="event"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="font-medium font-neue-haas text-[#020CBC]">
                            {getAssetIdentifier(log.details)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.details && typeof log.details === 'object' && (log.details as any).solution_name ? 
                              (log.details as any).solution_name : 
                              log.details && typeof log.details === 'object' && (log.details as any).solution ? 
                                (log.details as any).solution : 'N/A'
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-[#4D2BFB]/20 rounded">
                            <User className="h-3 w-3 text-[#4D2BFB]" />
                          </div>
                          <span className="font-neue-haas text-sm font-medium">
                            {getUserInfo(log.details)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-2 text-xs">
                          {log.details && typeof log.details === 'object' && (log.details as any).event_description && (
                            <div className="text-muted-foreground">
                              {(log.details as any).event_description}
                            </div>
                          )}
                          {log.details && typeof log.details === 'object' && 
                           (log.details as any).old_status_name && (log.details as any).new_status_name && (
                            <div className="flex items-center gap-2">
                              <StandardStatusBadge 
                                status={(log.details as any).old_status_name} 
                                className="text-xs"
                              />
                              <span className="text-[#03F9FF] font-bold">→</span>
                              <StandardStatusBadge 
                                status={(log.details as any).new_status_name} 
                                className="text-xs"
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="space-y-3">
                        <div className="p-3 bg-[#F0F3FF] rounded-lg w-fit mx-auto">
                          <Settings className="h-8 w-8 text-[#4D2BFB]" />
                        </div>
                        <div>
                          <p className="text-[#020CBC] font-neue-haas font-semibold">
                            Nenhum registro encontrado
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Ajuste os filtros para encontrar registros específicos
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredLogs.length > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground font-neue-haas bg-[#F0F3FF] px-4 py-2 rounded-lg">
            <Calendar className="h-4 w-4 text-[#4D2BFB]" />
            Mostrando {filteredLogs.length} registro(s) de histórico
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetHistory;
