
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackageSearch, Link as LinkIcon, Users, AlertTriangle, Network, Clock, ArrowRight, PlusCircle, Smartphone, Wifi, Server, Loader2 } from "lucide-react";
import { useDashboardStats, formatRelativeTime } from "@/hooks/useDashboardStats";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { data: dashboardStats, isLoading, error } = useDashboardStats();
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#4D2BFB]" />
        <p className="text-muted-foreground">Carregando dados do dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error || !dashboardStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-red-500 font-medium">Erro ao carregar dados</p>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Ocorreu um erro ao carregar os dados do dashboard."}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Plataforma BLUE</h1>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.totalAssets}
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <div className="flex items-center">
                <Smartphone className="h-3 w-3 mr-1 text-[#4D2BFB]" />
                <span>Chips</span>
              </div>
              <div className="flex items-center">
                <Wifi className="h-3 w-3 mr-1 text-[#4D2BFB]" />
                <span>Roteadores</span>
              </div>
              <div className="flex items-center">
                <Server className="h-3 w-3 mr-1 text-[#4D2BFB]" />
                <span>Switches</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeClients}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Clientes com dispositivos alocados
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos com Problema</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{dashboardStats.assetsWithIssues}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Necessitam atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status da Rede</CardTitle>
            <Network className="h-4 w-4 text-[#4D2BFB]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#4D2BFB]">Operacional</div>
            <p className="text-xs text-muted-foreground mt-2">
              Último check: 15 minutos atrás
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 border-dashed text-[#4D2BFB] hover:text-white" onClick={() => navigate('/assets/register')}>
            <PlusCircle className="h-6 w-6" />
            <div className="text-sm font-medium">Cadastrar Novo Ativo</div>
          </Button>

          <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 border-dashed text-[#4D2BFB] hover:text-white" onClick={() => navigate('/link-asset')}>
            <LinkIcon className="h-6 w-6" />
            <div className="text-sm font-medium">Vincular Ativo a Cliente</div>
          </Button>

          <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 border-dashed text-[#4D2BFB] hover:text-white" onClick={() => navigate('/assets/inventory')}>
            <PackageSearch className="h-6 w-6" />
            <div className="text-sm font-medium">Ver Inventário Completo</div>
          </Button>
        </CardContent>
      </Card>

      {/* Two-Column Layout for Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assets */}
        <Card className="rounded-2xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Últimos Ativos Registrados</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => navigate('/assets/inventory')}>
              Ver todos <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.recentAssets.map(asset => (
                <div key={asset.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {asset.type === "ROTEADOR" && <Wifi className="h-4 w-4 text-[#4D2BFB]" />}
                    {asset.type === "CHIP" && <Smartphone className="h-4 w-4 text-[#4D2BFB]" />}
                    {asset.type === "SWITCH" && <Server className="h-4 w-4 text-[#4D2BFB]" />}
                    <div>
                      <p className="text-sm font-medium">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">{asset.type}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{asset.status}</p>
                  </div>
                </div>
              ))}

              {dashboardStats.recentAssets.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum ativo registrado recentemente
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card className="rounded-2xl shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Eventos Recentes</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => navigate('/history')}>
              Ver histórico <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.recentEvents.map(event => (
                <div key={event.id} className="flex gap-3 border-b pb-2 last:border-0 last:pb-0">
                  <div className={`h-2 w-2 mt-2 rounded-full 
                    ${event.type === 'register' ? 'bg-green-500' : 
                      event.type === 'link' ? 'bg-blue-500' : 
                      'bg-amber-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{event.type}</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(event.time)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {dashboardStats.recentEvents.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum evento registrado recentemente
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
