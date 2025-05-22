
import React from "react";
import { useDashboardCards } from "@/hooks/useDashboardCards";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { 
  AlertTriangle, 
  Wifi,
  WifiOff,
  Check,
  X,
  ArrowRight,
  Bell,
  PieChart as PieChartIcon,
  CircleAlert,
  Loader2
} from "lucide-react";

const Home: React.FC = () => {
  const dashboard = useDashboardCards();
  
  // Loading state for the entire dashboard
  if (dashboard.isLoading) {
    return (
      <div className="space-y-6 p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
        <p className="text-lg text-muted-foreground">Carregando dados do dashboard...</p>
      </div>
    );
  }
  
  // Error state - only shown if all data failed to load
  if (dashboard.error) {
    return (
      <div className="space-y-4 p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">Erro ao carregar o dashboard</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Não foi possível carregar os dados necessários. Por favor, tente novamente mais tarde.
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  // Prepare data for pie chart
  const statusChartData = dashboard.statusDistribution.data.map(item => ({
    name: item.status,
    value: item.count,
  }));
  
  // Colors for chart
  const COLORS = ['#4D2BFB', '#0ea5e9', '#f97316', '#ef4444', '#8b5cf6', '#84cc16'];
  
  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      {/* Top Priority Cards - Status Imediato */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Ativos com Problema Card */}
        <Card className={`bg-red-50 border-red-200`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <span>
                  {dashboard.problemAssets.isLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <>
                      {dashboard.problemAssets.count} Ativos com Problema
                    </>
                  )}
                </span>
              </CardTitle>
            </div>
            <CardDescription className="text-red-700">
              Ativos que necessitam de atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {dashboard.problemAssets.isLoading ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : dashboard.problemAssets.data.length > 0 ? (
              <ul className="space-y-1">
                {dashboard.problemAssets.data.map(asset => (
                  <li key={asset.uuid} className="flex items-center gap-2 text-sm font-mono border-b border-red-100 py-1">
                    <CircleAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="font-semibold">{asset.identifier}</span>
                    <span className="text-xs text-muted-foreground">
                      ({asset.type} - {asset.status})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center py-3 text-sm text-muted-foreground">
                Nenhum ativo com problema detectado.
              </p>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link to="/assets/inventory?status=problem" className="w-full">
              <Button variant="destructive" className="w-full" size="sm">
                Ver todos os problemas
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Status da Rede Card */}
        <Card className={`${dashboard.networkStatus.data?.isOperational ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {dashboard.networkStatus.data?.isOperational ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-amber-600" />
              )}
              Status da Rede
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4 pb-6">
            {dashboard.networkStatus.isLoading ? (
              <Skeleton className="h-20 w-20 rounded-full" />
            ) : (
              <>
                <div className={`h-20 w-20 rounded-full flex items-center justify-center ${dashboard.networkStatus.data?.isOperational ? 'bg-green-100' : 'bg-amber-100'}`}>
                  {dashboard.networkStatus.data?.isOperational ? (
                    <Check className="h-10 w-10 text-green-600" />
                  ) : (
                    <X className="h-10 w-10 text-amber-600" />
                  )}
                </div>
                <p className={`mt-4 font-medium ${dashboard.networkStatus.data?.isOperational ? 'text-green-700' : 'text-amber-700'}`}>
                  {dashboard.networkStatus.data?.message}
                </p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground w-full text-center">
              Última verificação: {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Inventory Cards - Inventário Rápido */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Total de Chips Card */}
        <Card>
          <CardHeader>
            <CardTitle>Total de Chips</CardTitle>
            <CardDescription>Disponibilidade atual do inventário</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.assetsStats.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-32" />
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {dashboard.assetsStats.data.chips.total}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="size-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="size-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Disponíveis</p>
                      <p className="text-lg font-bold">
                        {dashboard.assetsStats.data.chips.available}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-4 bg-gray-300 rounded-full flex items-center justify-center">
                      <X className="size-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Indisponíveis</p>
                      <p className="text-lg font-bold">
                        {dashboard.assetsStats.data.chips.unavailable}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/assets/inventory?type=1" className="w-full">
              <Button variant="outline" className="w-full" size="sm">
                Ver todos os chips
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Total de Equipamentos Card */}
        <Card>
          <CardHeader>
            <CardTitle>Total de Equipamentos</CardTitle>
            <CardDescription>Disponibilidade atual do inventário</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.assetsStats.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-32" />
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {dashboard.assetsStats.data.equipment.total}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="size-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="size-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Disponíveis</p>
                      <p className="text-lg font-bold">
                        {dashboard.assetsStats.data.equipment.available}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-4 bg-gray-300 rounded-full flex items-center justify-center">
                      <X className="size-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Indisponíveis</p>
                      <p className="text-lg font-bold">
                        {dashboard.assetsStats.data.equipment.unavailable}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/assets/inventory?type=2" className="w-full">
              <Button variant="outline" className="w-full" size="sm">
                Ver todos os equipamentos
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Action Card - Associar/Desassociar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Associar/Desassociar Ativos
          </CardTitle>
          <CardDescription>
            Acesso rápido às operações de associação de ativos a clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/association">
              <Button className="w-full">Associar Ativo a Cliente</Button>
            </Link>
            <Link to="/association?operation=remove">
              <Button variant="outline" className="w-full">Desassociar Ativo</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Bottom Row - Monitoring Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Alerts Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas Recentes
            </CardTitle>
            <CardDescription>
              Últimos eventos e alertas registrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.recentAlerts.isLoading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : dashboard.recentAlerts.data.length > 0 ? (
              <ul className="space-y-3">
                {dashboard.recentAlerts.data.map((alert) => (
                  <li key={alert.id} className="bg-muted/50 p-2 rounded-lg text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{alert.assetType}</span>
                      <span className="text-xs text-muted-foreground">{alert.date}</span>
                    </div>
                    <p className="text-muted-foreground">{alert.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Bell className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">Nenhum alerta recente</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/history" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                Ver histórico completo
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Asset Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Equipamentos por Status
            </CardTitle>
            <CardDescription>
              Distribuição dos equipamentos por status
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {dashboard.statusDistribution.isLoading ? (
              <div className="h-[250px] w-full flex items-center justify-center">
                <Skeleton className="h-[220px] w-[220px] rounded-full" />
              </div>
            ) : dashboard.statusDistribution.data.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      label
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} ativos`, null]} />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] w-full flex items-center justify-center">
                <p className="text-muted-foreground">Sem dados disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
