
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Search,
  User2,
  Settings,
  AlertCircle,
  Loader2,
  Database,
  RefreshCw,
  ArrowLeft,
  Edit3,
  Plus,
  Trash2,
  Link2,
  UnlinkIcon,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssetHistory } from "@/hooks/useAssetHistory";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function History() {
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
  const getResponsibleUser = (log: any): string => {
    // Por enquanto, retorna um usuário genérico
    // Futura integração: extrair do log.details ou campo específico
    if (log.details && log.details.user_email) {
      return log.details.user_email;
    }
    return "Sistema Automático";
  };

  const handleRetry = () => {
    console.log('Tentando recarregar dados do histórico...');
    refetch();
    toast.info("Recarregando dados do histórico...");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-[#020CBC] font-neue-haas tracking-tight">
            Histórico de Alterações
          </h1>
          <p className="text-muted-foreground">Carregando histórico de movimentações...</p>
        </div>

        <Card className="border-[#4D2BFB]/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-12 w-12 text-[#4D2BFB] animate-spin mb-4" />
              <p className="text-center text-muted-foreground">
                Carregando dados do histórico...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-[#020CBC] font-neue-haas tracking-tight">
            Histórico de Alterações
          </h1>
          <p className="text-muted-foreground">Erro ao carregar histórico</p>
        </div>

        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-center text-destructive mb-2">
                Erro ao carregar o histórico de alterações
              </p>
              <p className="text-center text-muted-foreground text-sm mb-4">
                {error instanceof Error ? error.message : 'Erro desconhecido'}
              </p>
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                className="mb-2 border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB]/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
              <p className="text-center text-muted-foreground/70 text-xs">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header com identidade Legal */}
        <div className="flex flex-row gap-4 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-[#4D2BFB]/10 hover:text-[#4D2BFB]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-[#020CBC] font-neue-haas tracking-tight">
              Histórico de Alterações
            </h1>
            <p className="text-muted-foreground font-neue-haas">
              Histórico completo de movimentações e alterações de ativos
            </p>
          </div>
        </div>

        {/* Card de Filtros com identidade Legal */}
        <Card className="border-[#4D2BFB]/20 bg-gradient-to-r from-[#4D2BFB]/5 to-[#03F9FF]/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[#020CBC] font-neue-haas font-bold">
              <Search className="h-5 w-5 text-[#03F9FF]" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo de busca */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, ativo, evento ou detalhes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20"
                />
              </div>

              {/* Filtro por tipo de evento */}
              <Tabs value={eventFilter} onValueChange={setEventFilter} className="w-full">
                <TabsList className="grid grid-cols-5 w-full bg-white border border-[#4D2BFB]/20">
                  <TabsTrigger value="all" className="data-[state=active]:bg-[#4D2BFB] data-[state=active]:text-white">
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="creation" className="data-[state=active]:bg-[#03F9FF] data-[state=active]:text-[#020CBC]">
                    Criação
                  </TabsTrigger>
                  <TabsTrigger value="status" className="data-[state=active]:bg-[#4D2BFB] data-[state=active]:text-white">
                    Status
                  </TabsTrigger>
                  <TabsTrigger value="association" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                    Associação
                  </TabsTrigger>
                  <TabsTrigger value="deletion" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                    Exclusão
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Card de Resultados */}
        <Card className="border-[#4D2BFB]/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#020CBC] font-neue-haas font-bold">
                <Database className="h-5 w-5 text-[#03F9FF]" />
                Registros do Histórico ({filteredLogs.length})
              </div>
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                size="sm"
                className="border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB] hover:text-white transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#4D2BFB]/20">
                      <TableHead className="text-[#020CBC] font-neue-haas font-bold">Data e Hora</TableHead>
                      <TableHead className="text-[#020CBC] font-neue-haas font-bold">Evento</TableHead>
                      <TableHead className="text-[#020CBC] font-neue-haas font-bold">Ativo</TableHead>
                      <TableHead className="text-[#020CBC] font-neue-haas font-bold">Cliente</TableHead>
                      <TableHead className="text-[#020CBC] font-neue-haas font-bold">Usuário</TableHead>
                      <TableHead className="text-[#020CBC] font-neue-haas font-bold">Status</TableHead>
                      <TableHead className="text-[#020CBC] font-neue-haas font-bold">Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => {
                      const eventStyle = getEventStyle(log.event);
                      const responsibleUser = getResponsibleUser(log);
                      
                      return (
                        <TableRow 
                          key={log.id}
                          className="hover:bg-[#4D2BFB]/5 transition-colors duration-200 border-[#4D2BFB]/10"
                        >
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-[#03F9FF]" />
                              <span className="text-sm font-neue-haas">
                                {formatDate(log.date)}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded-full ${eventStyle.color} text-white`}>
                                {eventStyle.icon}
                              </div>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant={eventStyle.variant} className="font-neue-haas">
                                    {getEventDisplayName(log.event)}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Código técnico: {log.event}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Settings className="h-4 w-4 text-[#03F9FF]" />
                              <span className="font-mono text-sm font-neue-haas">
                                {log.asset_name || 'N/A'}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User2 className="h-4 w-4 text-[#03F9FF]" />
                              <span className="font-neue-haas">{log.client_name || 'Cliente não identificado'}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-[#03F9FF]" />
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="text-sm font-neue-haas text-[#020CBC]">
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

                          <TableCell>
                            {log.old_status || log.new_status ? (
                              <div className="space-y-1">
                                {log.old_status && (
                                  <div className="text-xs text-muted-foreground font-neue-haas">
                                    De: <span className="font-medium text-[#020CBC]">{log.old_status}</span>
                                  </div>
                                )}
                                {log.new_status && (
                                  <div className="text-xs font-neue-haas">
                                    Para: <span className="font-medium text-[#4D2BFB]">{log.new_status}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="max-w-xl">
                              <Tooltip>
                                <TooltipTrigger>
                                  <p className="text-sm truncate font-neue-haas" title={log.description}>
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
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-12 w-12 text-[#4D2BFB]/30 mb-4" />
                <p className="text-center text-muted-foreground mb-2 font-neue-haas">
                  {search || eventFilter !== "all"
                    ? "Nenhum registro encontrado com os filtros aplicados."
                    : "Nenhum registro encontrado no histórico."
                  }
                </p>
                <p className="text-center text-muted-foreground/70 text-sm mb-4 font-neue-haas">
                  {search || eventFilter !== "all"
                    ? "Tente ajustar os filtros de busca."
                    : "Os registros serão criados automaticamente quando ativos forem movimentados."
                  }
                </p>
                {!search && eventFilter === "all" && (
                  <Button 
                    onClick={handleRetry} 
                    variant="outline"
                    className="border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB] hover:text-white transition-all duration-200"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recarregar Dados
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
