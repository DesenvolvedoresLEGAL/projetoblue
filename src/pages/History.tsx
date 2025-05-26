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
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssetHistory } from "@/hooks/useAssetHistory";
import { AssetLogWithRelations } from "@/services/api/history/historyService";
import { toast } from "sonner";

/**
 * Página de Histórico de Alterações
 * Exibe logs reais do Supabase com dados relacionados via JOINs
 * Interface 100% em português com dados legíveis
 * Agora com melhor tratamento de erros e foreign keys corrigidas
 */
export default function History() {
  const {
    historyLogs,
    isLoading,
    error,
    refetch,
    getAssetIdentifier,
    getClientName,
    formatDate,
    getStatusDisplay,
    formatLogDetails,
    formatEventName
  } = useAssetHistory();

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  // Log para debug
  React.useEffect(() => {
    console.log('History component - historyLogs:', historyLogs);
    console.log('History component - isLoading:', isLoading);
    console.log('History component - error:', error);
  }, [historyLogs, isLoading, error]);

  /**
   * Filtra logs baseado na busca e tipo de evento
   */
  const filteredLogs = historyLogs.filter((log) => {
    // Filtro por busca (cliente, asset, evento)
    if (search) {
      const searchLower = search.toLowerCase();
      const clientName = getClientName(log).toLowerCase();
      const assetId = getAssetIdentifier(log).toLowerCase();
      const event = formatEventName(log.event).toLowerCase();
      const details = formatLogDetails(log.details).toLowerCase();
      
      if (!(clientName.includes(searchLower) || 
            assetId.includes(searchLower) || 
            event.includes(searchLower) ||
            details.includes(searchLower))) {
        return false;
      }
    }
    
    // Filtro por tipo de evento
    if (eventFilter !== "all") {
      if (eventFilter === "status" && !log.event.includes("STATUS")) {
        return false;
      }
      if (eventFilter === "association" && !log.event.includes("INSERT") && !log.event.includes("UPDATE")) {
        return false;
      }
      if (eventFilter === "creation" && !log.event.includes("CRIADO") && !log.event.includes("INSERT")) {
        return false;
      }
    }
    
    return true;
  });

  /**
   * Determina variante do badge baseado no tipo de evento
   */
  const getEventBadgeVariant = (event: string): "default" | "secondary" | "destructive" | "outline" => {
    if (event.includes('CRIADO') || event.includes('INSERT')) return "default";
    if (event.includes('STATUS')) return "secondary";
    if (event.includes('DELETE')) return "destructive";
    return "outline";
  };

  // Função para tentar recarregar dados
  const handleRetry = () => {
    console.log('Tentando recarregar dados do histórico...');
    refetch();
    toast.info("Recarregando dados do histórico...");
  };

  // Estado de loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Histórico de Alterações</h1>
          <p className="text-muted-foreground">Carregando histórico de movimentações...</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-center text-muted-foreground">
                Carregando dados do histórico...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado de erro melhorado
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Histórico de Alterações</h1>
          <p className="text-muted-foreground">Erro ao carregar histórico</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-center text-destructive mb-2">
                Erro ao carregar o histórico de alterações
              </p>
              <p className="text-center text-muted-foreground text-sm mb-4">
                {error instanceof Error ? error.message : 'Erro desconhecido'}
              </p>
              <Button onClick={handleRetry} variant="outline" className="mb-2">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Histórico de Alterações</h1>
        <p className="text-muted-foreground">
          Histórico completo de movimentações e alterações de ativos
        </p>
      </div>
      
      {/* Card de Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
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
                className="pl-8"
              />
            </div>
            
            {/* Filtro por tipo de evento */}
            <Tabs value={eventFilter} onValueChange={setEventFilter} className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="creation">Criação</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="association">Associação</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      {/* Card de Resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Registros do Histórico ({filteredLogs.length})
            </div>
            <Button onClick={handleRetry} variant="outline" size="sm">
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
                  <TableRow>
                    <TableHead>Data e Hora</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const statusDisplay = getStatusDisplay(log);
                    
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(log.date)}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={getEventBadgeVariant(log.event)}>
                            {formatEventName(log.event)}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">
                              {getAssetIdentifier(log)}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User2 className="h-4 w-4 text-muted-foreground" />
                            <span>{getClientName(log)}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {statusDisplay.before || statusDisplay.after ? (
                            <div className="space-y-1">
                              {statusDisplay.before && (
                                <div className="text-xs text-muted-foreground">
                                  De: <span className="font-medium">{statusDisplay.before}</span>
                                </div>
                              )}
                              {statusDisplay.after && (
                                <div className="text-xs">
                                  Para: <span className="font-medium">{statusDisplay.after}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm truncate" title={formatLogDetails(log.details)}>
                              {formatLogDetails(log.details)}
                            </p>
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
              <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-center text-muted-foreground mb-2">
                {search || eventFilter !== "all" 
                  ? "Nenhum registro encontrado com os filtros aplicados." 
                  : "Nenhum registro encontrado no histórico."
                }
              </p>
              <p className="text-center text-muted-foreground/70 text-sm mb-4">
                {search || eventFilter !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Os registros serão criados automaticamente quando ativos forem movimentados."
                }
              </p>
              {!search && eventFilter === "all" && (
                <Button onClick={handleRetry} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar Dados
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
