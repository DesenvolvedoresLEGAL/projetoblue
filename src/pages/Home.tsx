
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

  console.log(dashboard.problemAssets);
  
  // Colors for chart
  const COLORS = ['#4D2BFB', '#0ea5e9', '#f97316', '#ef4444', '#8b5cf6', '#84cc16'];
  
  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      {/* Inventory Cards - Inventário Rápido */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {/* Total de Chips Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-normal">Total de Chips: <span className="font-semibold">{dashboard.assetsStats.data.chips.total}</span></CardTitle>
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
        
        {/* Total de SPEEDYS 5G */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-normal">Total de Speedys 5G: <span className="font-semibold">{dashboard.assetsStats.data.speedys.total}</span></CardTitle>
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
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="size-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="size-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Disponíveis</p>
                      <p className="text-lg font-bold">
                        {dashboard.assetsStats.data.speedys.available}
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
                        {dashboard.assetsStats.data.speedys.unavailable}
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
                Ver todos os Speedys 5G
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Total de Equipamentos Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-normal">Total de Equipamentos: <span className="font-semibold">{dashboard.assetsStats.data.equipment.total}</span></CardTitle>
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
            <Link to="/assets/inventory" className="w-full">
              <Button variant="outline" className="w-full" size="sm">
                Ver todos os equipamentos
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Top Priority Cards - Status Imediato */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Chips com Problema Card */}
        <Card className={`bg-red-50 border-red-200 flex flex-col h-full`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <span>
                  {dashboard.problemAssets.isLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <>
                      {dashboard.problemAssets.data.filter(a => a.type ===  "CHIP").length} Chips com Problema
                    </>
                  )}
                </span>
              </CardTitle>
            </div>
            <CardDescription className="text-red-700">
              Ativos que necessitam de atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2 flex-1">
            {dashboard.problemAssets.isLoading ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : dashboard.problemAssets.data.length > 0 ? (
              <ul className="space-y-1">
                {dashboard.problemAssets.data.filter(asset => asset.type === "CHIP").map(asset => (
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
          <CardFooter className="pt-0 mt-auto">
            <Link to="/assets/inventory" className="w-full">
              <Button variant="destructive" className="w-full" size="sm">
                Ver todos os problemas
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Speedys com problema CARD */}
        <Card className={`bg-red-50 border-red-200 flex flex-col h-full`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <span>
                  {dashboard.problemAssets.isLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <>
                      {dashboard.problemAssets.data.filter(a => a.type ===  "SPEEDY 5G").length} Speedys com Problema
                    </>
                  )}
                </span>
              </CardTitle>
            </div>
            <CardDescription className="text-red-700">
              Ativos que necessitam de atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2 flex-1">
            {dashboard.problemAssets.isLoading ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : dashboard.problemAssets.data.length > 0 ? (
              <ul className="space-y-1">
                {dashboard.problemAssets.data.filter(asset => asset.type === "SPEEDY 5G").map(asset => (
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
          <CardFooter className="pt-0 mt-auto">
            <Link to="/assets/inventory?status=problem" className="w-full">
              <Button variant="destructive" className="w-full" size="sm">
                Ver todos os problemas
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Equipamentos com problema CARD */}
        <Card className={`bg-red-50 border-red-200 flex flex-col h-full`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <span>
                  {dashboard.problemAssets.isLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <>
                      {dashboard.problemAssets.data.filter(a => a.type !==  "CHIP").length} Equipamentos com Problema
                    </>
                  )}
                </span>
              </CardTitle>
            </div>
            <CardDescription className="text-red-700">
              Ativos que necessitam de atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2 flex-1">
            {dashboard.problemAssets.isLoading ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : dashboard.problemAssets.data.length > 0 ? (
              <ul className="space-y-1">
                {dashboard.problemAssets.data.filter(asset => asset.type !== "CHIP").map(asset => (
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
          <CardFooter className="pt-0 mt-auto">
            <Link to="/assets/inventory?status=problem" className="w-full">
              <Button variant="destructive" className="w-full" size="sm">
                Ver todos os problemas
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Bottom Row - Monitoring Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Alerts Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Atividades Recentes
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
                      <span className="font-medium">{alert.assetType} - {alert.name}</span>
                      <span className="text-xs text-muted-foreground">{alert.date}</span>
                    </div>
                    <p className="text-muted-foreground">{alert.description.includes('CRIADO') ? 
                    alert.description.capitalize() :
                    `${alert.description.capitalize()} de ${alert.old_status} para ${alert.new_status}`}
                    </p>
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
              Ativos por Status
            </CardTitle>
            <CardDescription>
              Distribuição dos ativos por status
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
