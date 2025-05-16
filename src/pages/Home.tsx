import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackageSearch, Link as LinkIcon, Users, AlertTriangle, Network, Clock, LayoutDashboard, PlusCircle, ArrowRight, Smartphone, Wifi, Server } from "lucide-react";

// Mock data for the dashboard, to be replaced with real data later
const mockData = {
  assets: {
    chips: 156,
    routers: 89,
    switches: 32
  },
  activeClients: 47,
  problemAssets: 8,
  recentAssets: [{
    id: 1,
    name: "Router R450",
    type: "Router",
    date: "2 horas atrás"
  }, {
    id: 2,
    name: "Chip 7798551234",
    type: "Chip",
    date: "4 horas atrás"
  }, {
    id: 3,
    name: "Switch S120",
    type: "Switch",
    date: "1 dia atrás"
  }, {
    id: 4,
    name: "Chip 7798559876",
    type: "Chip",
    date: "2 dias atrás"
  }, {
    id: 5,
    name: "Router R221",
    type: "Router",
    date: "3 dias atrás"
  }],
  recentEvents: [{
    id: 1,
    event: "Registro de Ativo",
    description: "Router R450 registrado",
    time: "2 horas atrás"
  }, {
    id: 2,
    event: "Vinculação",
    description: "Chip associado ao cliente TechCorp",
    time: "4 horas atrás"
  }, {
    id: 3,
    event: "Alteração de Status",
    description: "Router R221 marcado como defeituoso",
    time: "1 dia atrás"
  }, {
    id: 4,
    event: "Manutenção",
    description: "Switch S120 enviado para reparo",
    time: "2 dias atrás"
  }, {
    id: 5,
    event: "Desvinculação",
    description: "Chip 7791234567 desvinculado de DataNet",
    time: "3 dias atrás"
  }]
};
const Home: React.FC = () => {
  const navigate = useNavigate();
  return <div className="space-y-6 pb-10">
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
              {mockData.assets.chips + mockData.assets.routers + mockData.assets.switches}
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <div className="flex items-center">
                <Smartphone className="h-3 w-3 mr-1 text-[#4D2BFB]" />
                <span>{mockData.assets.chips} chips</span>
              </div>
              <div className="flex items-center">
                <Wifi className="h-3 w-3 mr-1 text-[#4D2BFB]" />
                <span>{mockData.assets.routers} roteadores</span>
              </div>
              <div className="flex items-center">
                <Server className="h-3 w-3 mr-1 text-[#4D2BFB]" />
                <span>{mockData.assets.switches} switches</span>
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
            <div className="text-2xl font-bold">{mockData.activeClients}</div>
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
            <div className="text-2xl font-bold text-red-500">{mockData.problemAssets}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Necessitam atenção imediata
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status da Rede</CardTitle>
            <Network className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Operacional</div>
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
              {mockData.recentAssets.map(asset => <div key={asset.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {asset.type === 'Router' && <Wifi className="h-4 w-4 text-[#4D2BFB]" />}
                    {asset.type === 'Chip' && <Smartphone className="h-4 w-4 text-[#4D2BFB]" />}
                    {asset.type === 'Switch' && <Server className="h-4 w-4 text-[#4D2BFB]" />}
                    <div>
                      <p className="text-sm font-medium">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">{asset.type}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{asset.date}</p>
                  </div>
                </div>)}
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
              {mockData.recentEvents.map(event => <div key={event.id} className="flex gap-3 border-b pb-2 last:border-0 last:pb-0">
                  <div className={`h-2 w-2 mt-2 rounded-full 
                    ${event.event === 'Registro de Ativo' ? 'bg-green-500' : event.event === 'Vinculação' ? 'bg-blue-500' : event.event === 'Alteração de Status' ? 'bg-amber-500' : event.event === 'Manutenção' ? 'bg-purple-500' : 'bg-red-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{event.event}</span>
                      <span className="text-xs text-muted-foreground">{event.time}</span>
                    </div>
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Home;