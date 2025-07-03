
import React, { useState } from "react";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { StandardFiltersCard } from "@/components/ui/standard-filters-card";
import { StandardStatusBadge } from "@/components/ui/standard-status-badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssetLog } from "@/types/asset";
import {
  Calendar,
  Search,
  User2,
  Settings,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Edit3,
  Plus,
  Trash2,
  Link2,
  UserCheck,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssetHistory } from "@/modules/assets/hooks/useAssetHistory";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function HistoryPage() {
  const {
    historyLogs,
    isLoading,
    error,
    refetch,
    formatDate,
    formatEventName
  } = useAssetHistory();

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const navigate = useNavigate();

  // Filtros usando os dados já processados
  const filteredLogs = historyLogs.filter((log) => {
    // Filtro por busca usando os dados já processados
    if (search) {
      const searchLower = search.toLowerCase();
      const clientName = (log.client_name || 'Cliente não identificado').toLowerCase();
      const assetName = (log.asset_name || 'N/A').toLowerCase();
      const event = getEventDisplayName(log.event).toLowerCase();
      const description = (log.description || '').toLowerCase();

      if (!(clientName.includes(searchLower) ||
        assetName.includes(searchLower) ||
        event.includes(searchLower) ||
        description.includes(searchLower))) {
        return false;
      }
    }

    // Filtro por tipo de evento
    if (eventFilter !== "all") {
      if (eventFilter === "status" && !log.event.includes("STATUS") && !log.event.includes("UPDATE")) {
        return false;
      }
      if (eventFilter === "association" && !log.event.includes("ASSOCIATION")) {
        return false;
      }
      if (eventFilter === "creation" && !log.event.includes("CRIADO") && !log.event.includes("INSERT")) {
        return false;
      }
      if (eventFilter === "deletion" && !log.event.includes("DELETE") && !log.event.includes("REMOVE")) {
        return false;
      }
    }

    return true;
  });

  // Função para obter nome legível do evento
  const getEventDisplayName = (event: string): string => {
    const eventTranslations: Record<string, string> = {
      'INSERT': 'Ativo criado',
      'UPDATE': 'Dados atualizados',
      'DELETE': 'Ativo excluído',
      'STATUS_UPDATED': 'Status alterado',
      'ASSET_CRIADO': 'Ativo criado',
      'SOFT_DELETE': 'Ativo removido',
      'ASSOCIATION': 'Nova associação',
      'ASSOCIATION_CREATED': 'Nova associação',
      'DISASSOCIATION': 'Associação removida',
      'ASSOCIATION_ENDED': 'Associação encerrada',
      'ASSOCIATION_REMOVED': 'Associação removida'
    };
    
    return eventTranslations[event] || event;
  };

  // Função para obter ícone e cor do evento
  const getEventStyle = (event: string) => {
    if (event.includes('UPDATE') || event.includes('STATUS')) {
      return {
        icon: <Edit3 className="h-4 w-4" />,
        color: 'bg-[#4D2BFB]',
        variant: 'default' as const
      };
    }
    if (event.includes('ASSOCIATION') && !event.includes('DISASSOCIATION') && !event.includes('ENDED') && !event.includes('REMOVED')) {
      return {
        icon: <Link2 className="h-4 w-4" />,
        color: 'bg-green-500',
        variant: 'success' as const
      };
    }
    if (event.includes('CRIADO') || event.includes('INSERT')) {
      return {
        icon: <Plus className="h-4 w-4" />,
        color: 'bg-[#03F9FF]',
        variant: 'secondary' as const
      };
    }
    if (event.includes('DELETE') || event.includes('DISASSOCIATION') || event.includes('ENDED') || event.includes('REMOVED')) {
      return {
        icon: <Trash2 className="h-4 w-4" />,
        color: 'bg-red-500',
        variant: 'destructive' as const
      };
    }
    return {
      icon: <Settings className="h-4 w-4" />,
      color: 'bg-gray-500',
      variant: 'outline' as const
    };
  };

  // Função para simular usuário responsável (futura integração)
  const getResponsibleUser = (log: AssetLog): string => {
    // Por enquanto, retorna um usuário genérico
    // Futura integração: extrair do log.details ou campo específico
    if (log.details && log.details.user_email) {
      return log.details.user_email;
    }
    return "Sistema Automático";
  };

  const handleRetry = () => {
    if (import.meta.env.DEV) console.log('Tentando recarregar dados do histórico...');
    refetch();
    toast.info("Recarregando dados do histórico...");
  };

  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="space-y-6">
          <StandardPageHeader
            icon={History}
            title="Histórico de Alterações"
            description="Carregando histórico de movimentações..."
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

          <Card className="border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal dark:shadow-legal-dark">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-12 w-12 text-legal-primary dark:text-legal-secondary animate-spin mb-4" />
                <p className="text-center text-muted-foreground font-neue-haas">
                  Carregando dados do histórico...
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
            description="Erro ao carregar histórico"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 p-0 hover:bg-legal-primary/10 hover:text-legal-primary dark:hover:bg-legal-secondary/10 dark:hover:text-legal-secondary transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </StandardPageHeader>

          <Card className="border-red-200 dark:border-red-800/30 shadow-legal dark:shadow-legal-dark">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-10">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-center text-destructive mb-2 font-neue-haas">
                  Erro ao carregar o histórico de alterações
                </p>
                <p className="text-center text-muted-foreground text-sm mb-4 font-neue-haas">
                  {error instanceof Error ? error.message : 'Erro desconhecido'}
                </p>
                <Button 
                  onClick={handleRetry} 
                  variant="outline" 
                  className="mb-2 border-legal-primary/30 text-legal-primary hover:bg-legal-primary hover:text-white dark:border-legal-secondary/30 dark:text-legal-secondary dark:hover:bg-legal-secondary dark:hover:text-legal-dark transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                <p className="text-center text-muted-foreground/70 text-xs font-neue-haas">
                  Verifique sua conexão e tente novamente.
                </p>
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
        {/* Header padronizado com botão voltar à direita */}
        <StandardPageHeader
          icon={History}
          title="Histórico de Alterações"
          description="Histórico completo de movimentações e alterações de ativos"
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

        {/* Card de Filtros padronizado */}
        <StandardFiltersCard>
          <div className="space-y-4">
            {/* Campo de busca */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium font-neue-haas text-legal-dark dark:text-text-primary-dark">
                Buscar por cliente, ativo, evento ou detalhes
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Digite para buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 border-legal-primary/30 focus:border-legal-primary focus:ring-legal-primary/20 dark:border-legal-secondary/30 dark:focus:border-legal-secondary dark:focus:ring-legal-secondary/20"
                />
              </div>
            </div>

            {/* Filtro por tipo de evento usando ToggleGroup */}
            <div className="space-y-2">
              <Label className="text-sm font-medium font-neue-haas text-legal-dark dark:text-text-primary-dark">
                Filtrar por tipo de evento
              </Label>
              <ToggleGroup value={eventFilter} onValueChange={setEventFilter}>
                <ToggleGroupItem 
                  value="all"
                  className="data-[state=on]:bg-legal-primary data-[state=on]:text-white dark:data-[state=on]:bg-legal-secondary dark:data-[state=on]:text-legal-dark hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10 transition-all duration-200"
                >
                  Todos
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="creation"
                  className="data-[state=on]:bg-legal-primary data-[state=on]:text-white dark:data-[state=on]:bg-legal-secondary dark:data-[state=on]:text-legal-dark hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10 transition-all duration-200"
                >
                  Criação
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="status"
                  className="data-[state=on]:bg-legal-primary data-[state=on]:text-white dark:data-[state=on]:bg-legal-secondary dark:data-[state=on]:text-legal-dark hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10 transition-all duration-200"
                >
                  Status
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="association"
                  className="data-[state=on]:bg-legal-primary data-[state=on]:text-white dark:data-[state=on]:bg-legal-secondary dark:data-[state=on]:text-legal-dark hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10 transition-all duration-200"
                >
                  Associação
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="deletion"
                  className="data-[state=on]:bg-legal-primary data-[state=on]:text-white dark:data-[state=on]:bg-legal-secondary dark:data-[state=on]:text-legal-dark hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10 transition-all duration-200"
                >
                  Exclusão
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </StandardFiltersCard>

        {/* Card de Resultados */}
        <Card className="border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal dark:shadow-legal-dark">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-legal-primary/20 dark:border-legal-secondary/20 bg-legal-primary/5 dark:bg-legal-secondary/5">
                    <TableHead className="font-neue-haas text-legal-primary dark:text-legal-secondary font-semibold">Data e Hora</TableHead>
                    <TableHead className="font-neue-haas text-legal-primary dark:text-legal-secondary font-semibold">Evento</TableHead>
                    <TableHead className="font-neue-haas text-legal-primary dark:text-legal-secondary font-semibold">Ativo</TableHead>
                    <TableHead className="font-neue-haas text-legal-primary dark:text-legal-secondary font-semibold">Cliente</TableHead>
                    <TableHead className="font-neue-haas text-legal-primary dark:text-legal-secondary font-semibold">Usuário</TableHead>
                    <TableHead className="font-neue-haas text-legal-primary dark:text-legal-secondary font-semibold">Status</TableHead>
                    <TableHead className="font-neue-haas text-legal-primary dark:text-legal-secondary font-semibold">Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, index) => {
                      const eventStyle = getEventStyle(log.event);
                      const responsibleUser = getResponsibleUser(log);
                      const isEvenRow = index % 2 === 0;
                      
                      return (
                        <TableRow 
                          key={log.id}
                          className={`hover:bg-legal-primary/5 dark:hover:bg-legal-secondary/5 transition-colors duration-200 border-legal-primary/10 dark:border-legal-secondary/10 ${
                            isEvenRow ? 'bg-white dark:bg-bg-primary-dark' : 'bg-legal-primary/[0.02] dark:bg-bg-secondary-dark'
                          }`}
                        >
                          <TableCell className="whitespace-nowrap py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-legal-secondary dark:text-legal-secondary" />
                              <span className="text-sm font-neue-haas text-legal-dark dark:text-text-primary-dark">
                                {formatDate(log.date)}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded-full ${eventStyle.color} text-white`}>
                                {eventStyle.icon}
                              </div>
                              <Tooltip>
                                <TooltipTrigger>
                                  <StandardStatusBadge 
                                    status={getEventDisplayName(log.event)} 
                                    type="event"
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Código técnico: {log.event}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>

                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <Settings className="h-4 w-4 text-legal-secondary dark:text-legal-secondary" />
                              <span className="font-mono text-sm font-neue-haas text-legal-dark dark:text-text-primary-dark">
                                {log.asset_name || 'N/A'}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <User2 className="h-4 w-4 text-legal-secondary dark:text-legal-secondary" />
                              <span className="font-neue-haas text-legal-dark dark:text-text-primary-dark">{log.client_name || 'Cliente não identificado'}</span>
                            </div>
                          </TableCell>

                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-legal-secondary dark:text-legal-secondary" />
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="text-sm font-neue-haas text-legal-primary dark:text-legal-secondary">
                                    {responsibleUser}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {responsibleUser === "Sistema Automático" 
                                      ? "Operação realizada automaticamente pelo sistema"
                                      : `Operação realizada por: ${responsibleUser}`
                                    }
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>

                          <TableCell className="py-4">
                            {log.old_status || log.new_status ? (
                              <div className="space-y-1">
                                {log.old_status && (
                                  <div className="text-xs text-muted-foreground font-neue-haas">
                                    De: <StandardStatusBadge status={log.old_status} className="text-xs" />
                                  </div>
                                )}
                                {log.new_status && (
                                  <div className="text-xs font-neue-haas">
                                    Para: <StandardStatusBadge status={log.new_status} className="text-xs" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>

                          <TableCell className="py-4">
                            <div className="max-w-xl">
                              <Tooltip>
                                <TooltipTrigger>
                                  <p className="text-sm truncate font-neue-haas text-legal-dark dark:text-text-primary-dark" title={log.description}>
                                    {log.description || 'Nenhum detalhe disponível'}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs max-w-xs">
                                    {log.description || 'Nenhum detalhe técnico disponível para este evento'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="space-y-3">
                          <div className="p-3 bg-legal-primary/5 dark:bg-legal-secondary/5 rounded-lg w-fit mx-auto">
                            <Calendar className="h-8 w-8 text-legal-primary dark:text-legal-secondary" />
                          </div>
                          <div>
                            <p className="text-legal-primary dark:text-legal-secondary font-neue-haas font-semibold">
                              {search || eventFilter !== "all"
                                ? "Nenhum registro encontrado com os filtros aplicados"
                                : "Nenhum registro encontrado no histórico"
                              }
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 font-neue-haas">
                              {search || eventFilter !== "all"
                                ? "Tente ajustar os filtros de busca"
                                : "Os registros serão criados automaticamente quando ativos forem movimentados"
                              }
                            </p>
                          </div>
                          {!search && eventFilter === "all" && (
                            <Button 
                              onClick={handleRetry} 
                              variant="outline"
                              className="border-legal-primary/30 text-legal-primary hover:bg-legal-primary hover:text-white dark:border-legal-secondary/30 dark:text-legal-secondary dark:hover:bg-legal-secondary dark:hover:text-legal-dark transition-all duration-200"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Recarregar Dados
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Footer com contador de registros */}
        {filteredLogs.length > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground font-neue-haas bg-legal-primary/5 dark:bg-legal-secondary/5 px-4 py-2 rounded-lg border border-legal-primary/20 dark:border-legal-secondary/20">
              <Calendar className="h-4 w-4 text-legal-primary dark:text-legal-secondary" />
              Mostrando {filteredLogs.length} registro(s) de histórico
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
