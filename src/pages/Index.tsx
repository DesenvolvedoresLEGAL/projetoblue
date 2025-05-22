
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ChevronRight, HardDrive, CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  // Query para buscar todos os ativos com suas relações
  const { data: assets, isLoading, error } = useQuery({
    queryKey: ["assets-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select(`
          uuid,
          solution_id,
          status_id,
          serial_number,
          iccid,
          radio,
          line_number,
          model,
          status:asset_status(id, status),
          solucao:asset_solutions(id, solution)
        `)
        .is("deleted_at", null);

      if (error) throw error;
      return data || [];
    }
  });

  // Processamento dos dados para os cards
  const dashboardStats = React.useMemo(() => {
    if (!assets) return null;
    
    // Definições baseadas na análise do código
    const CHIP_SOLUTION_ID = 11;
    const AVAILABLE_STATUS_ID = 1;
    const PROBLEM_STATUS_IDS = [5, 6]; // BLOQUEADO e MANUTENÇÃO
    
    // Divide ativos em chips e equipamentos
    const chips = assets.filter(asset => asset.solution_id === CHIP_SOLUTION_ID);
    const equipments = assets.filter(asset => asset.solution_id !== CHIP_SOLUTION_ID);
    
    // Calcula chips disponíveis e indisponíveis
    const availableChips = chips.filter(chip => chip.status_id === AVAILABLE_STATUS_ID);
    const unavailableChips = chips.filter(chip => chip.status_id !== AVAILABLE_STATUS_ID);
    
    // Calcula equipamentos disponíveis e indisponíveis
    const availableEquipments = equipments.filter(equip => equip.status_id === AVAILABLE_STATUS_ID);
    const unavailableEquipments = equipments.filter(equip => equip.status_id !== AVAILABLE_STATUS_ID);
    
    // Identifica ativos com problemas (status_id em PROBLEM_STATUS_IDS)
    const problemChips = chips.filter(chip => PROBLEM_STATUS_IDS.includes(chip.status_id));
    const problemEquipments = equipments.filter(equip => PROBLEM_STATUS_IDS.includes(equip.status_id));
    
    return {
      totalChips: chips.length,
      availableChips: availableChips.length,
      unavailableChips: unavailableChips.length,
      
      totalEquipments: equipments.length,
      availableEquipments: availableEquipments.length,
      unavailableEquipments: unavailableEquipments.length,
      
      problemChips,
      problemEquipments
    };
  }, [assets]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="relative">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h2 className="text-xl font-semibold">Erro ao carregar dados do dashboard</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Ocorreu um erro ao buscar as informações dos ativos. Por favor, tente novamente mais tarde.
        </p>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  // Empty state
  if (!dashboardStats || (!dashboardStats.totalChips && !dashboardStats.totalEquipments)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <HardDrive className="h-10 w-10 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Nenhum ativo encontrado</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Não há ativos registrados no sistema. Adicione novos ativos para visualizá-los aqui.
        </p>
        <Button asChild>
          <Link to="/assets/register">Adicionar Novo Ativo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral de todos os ativos do sistema e sua distribuição.
        </p>
      </div>
      
      {/* Cards de Resumo - Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card de Total de Chips */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Total de Chips</CardTitle>
              <CircleAlert className="h-5 w-5 text-blue-500" />
            </div>
            <CardDescription>Todos os chips cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{dashboardStats.totalChips}</div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Disponíveis:</span>
                <span className="font-semibold text-green-500">{dashboardStats.availableChips}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Indisponíveis:</span>
                <span className="font-semibold text-amber-500">{dashboardStats.unavailableChips}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" asChild className="w-full text-xs">
              <Link to="/assets/inventory?type=chip">
                Ver todos os chips
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Card de Total de Equipamentos */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Total de Equipamentos</CardTitle>
              <HardDrive className="h-5 w-5 text-purple-500" />
            </div>
            <CardDescription>Todos os equipamentos cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{dashboardStats.totalEquipments}</div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Disponíveis:</span>
                <span className="font-semibold text-green-500">{dashboardStats.availableEquipments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Indisponíveis:</span>
                <span className="font-semibold text-amber-500">{dashboardStats.unavailableEquipments}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" asChild className="w-full text-xs">
              <Link to="/assets/inventory?type=equipment">
                Ver todos os equipamentos
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Card de Chips com Problemas */}
        <Card className="border-red-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Chips com Problemas</CardTitle>
              <CircleAlert className="h-5 w-5 text-red-500" />
            </div>
            <CardDescription>Chips em estados críticos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-500">{dashboardStats.problemChips.length}</div>
            
            {dashboardStats.problemChips.length > 0 ? (
              <div className="mt-4 max-h-32 overflow-y-auto">
                <ul className="space-y-2">
                  {dashboardStats.problemChips.map(chip => (
                    <li key={chip.uuid} className="text-sm flex items-center gap-2">
                      <Badge variant="destructive" className="shrink-0">
                        {chip.status?.status || "Problema"}
                      </Badge>
                      <span className="truncate" title={chip.iccid || chip.line_number?.toString() || chip.serial_number}>
                        {chip.iccid || (chip.line_number !== null ? String(chip.line_number) : chip.serial_number) || "Chip sem ID"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Nenhum chip com problema encontrado</p>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" asChild className="w-full text-xs">
              <Link to="/assets/inventory?type=chip&status=problem">
                Gerenciar problemas
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Card de Equipamentos com Problemas */}
        <Card className="border-red-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Equipamentos com Problemas</CardTitle>
              <CircleAlert className="h-5 w-5 text-red-500" />
            </div>
            <CardDescription>Equipamentos em estados críticos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-500">{dashboardStats.problemEquipments.length}</div>
            
            {dashboardStats.problemEquipments.length > 0 ? (
              <div className="mt-4 max-h-32 overflow-y-auto">
                <ul className="space-y-2">
                  {dashboardStats.problemEquipments.map(equipment => (
                    <li key={equipment.uuid} className="text-sm flex items-center gap-2">
                      <Badge variant="destructive" className="shrink-0">
                        {equipment.status?.status || "Problema"}
                      </Badge>
                      <span className="truncate" title={equipment.radio || equipment.serial_number || equipment.model}>
                        {equipment.radio || equipment.serial_number || equipment.model || "Equip. sem ID"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Nenhum equipamento com problema encontrado</p>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" asChild className="w-full text-xs">
              <Link to="/assets/inventory?type=equipment&status=problem">
                Gerenciar problemas
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Painéis de informações adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status detalhados por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Visão detalhada da distribuição dos ativos por status</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chips">
              <TabsList className="mb-4">
                <TabsTrigger value="chips">Chips</TabsTrigger>
                <TabsTrigger value="equipments">Equipamentos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chips">
                {assets && (
                  <StatusDistributionChart 
                    assets={assets.filter(asset => asset.solution_id === 11)} 
                  />
                )}
              </TabsContent>
              
              <TabsContent value="equipments">
                {assets && (
                  <StatusDistributionChart 
                    assets={assets.filter(asset => asset.solution_id !== 11)} 
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Histórico de atividades recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações Recentes</CardTitle>
            <CardDescription>Últimas operações realizadas no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivitiesPanel />
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/history">
                Ver histórico completo
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// Componente para exibir distribuição de status
const StatusDistributionChart = ({ assets }) => {
  // Agrupar por status
  const statusCounts = React.useMemo(() => {
    const counts = {};
    
    assets.forEach(asset => {
      const status = asset.status?.status || "Desconhecido";
      counts[status] = (counts[status] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }, [assets]);
  
  if (statusCounts.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>;
  }
  
  // Define cores por status
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('disponível')) return "bg-green-500";
    if (statusLower.includes('alugado')) return "bg-blue-500";
    if (statusLower.includes('bloqueado')) return "bg-red-500";
    if (statusLower.includes('manut')) return "bg-amber-500";
    if (statusLower.includes('sem dados')) return "bg-gray-500";
    return "bg-purple-500";
  };
  
  return (
    <div className="space-y-4">
      {statusCounts.map(({ status, count }) => (
        <div key={status} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{status}</span>
            <span className="font-medium">{count}</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${getStatusColor(status)}`} 
              style={{ width: `${(count / assets.length) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para exibir histórico recente
const RecentActivitiesPanel = () => {
  // Buscar histórico de movimentações recentes
  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_logs")
        .select(`
          id,
          date,
          event,
          details,
          assoc_id,
          status_before_id,
          status_after_id
        `)
        .order("date", { ascending: false })
        .limit(5);
        
      if (error) throw error;
      return data || [];
    }
  });
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-muted-foreground">Nenhuma atividade recente encontrada</p>
      </div>
    );
  }
  
  // Formatar data para exibição
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        // Extrair informações do objeto details
        const details = typeof activity.details === 'object' ? activity.details : {};
        const assetId = details?.asset_id || 'N/A';
        const clientId = details?.client_id;
        
        return (
          <div key={activity.id} className="border-b pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {(activity.event || "").toLowerCase()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(activity.date)}
              </span>
            </div>
            
            <div className="mt-2 text-sm">
              <p>
                <span className="font-medium">Asset ID: </span>
                <Link to={`/assets/details/${assetId}`} className="text-blue-500 hover:underline">
                  {typeof assetId === 'string' && assetId.substring(0, 8)}...
                </Link>
              </p>
              
              {clientId && (
                <p>
                  <span className="font-medium">Cliente: </span>
                  <Link to={`/clients/${clientId}`} className="text-blue-500 hover:underline">
                    {typeof clientId === 'string' && clientId.substring(0, 8)}...
                  </Link>
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Index;
