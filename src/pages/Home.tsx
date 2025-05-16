
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackageSearch, Link as LinkIcon, Users, AlertTriangle, Network, Clock, LayoutDashboard, PlusCircle, ArrowRight, Smartphone, Wifi, Server } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const today = new Date().toISOString().slice(0, 10);

enum AssetType {
  CHIP = 1,
  ROUTER = 2
}

const [{ data: chips }, { data: routers }, { data: switches }] = await Promise.all([
  supabase.from('assets').select('*').eq('type_id', 1),
  supabase.from('assets').select('*').eq('type_id', 2),
  supabase.from('assets').select('*').eq('solution_id', 7)
]);

const { data: recentAssets } = await supabase
  .from("assets")
  .select("uuid, iccid, model, radio, serial_number, line_number, type_id, status_id, solution_id, created_at")
  .order("created_at", { ascending: false }) // mais novo primeiro
  .limit(5)                              // pega só 'limit' linhas
  .throwOnError();

const { count: activeClients, error: eActiveClients } = await supabase
  .from("v_active_clients")
  .select("*", { head: true, count: "exact" })
  .throwOnError();

const chipsComProblema =
  (chips ?? []).filter(({ status_id }) => [4, 5, 6].includes(status_id));

const { data: recentEvents, error } = await supabase
  .from('asset_logs')
  .select('id, event, details, date')
  .order('date', { ascending: false })
  .limit(5)
  .throwOnError();

// Fix for TS2339: We need to type the "details" correctly and safely access properties
const mappedRecentEvents = recentEvents.map(row => {
  const event = row.event ?? 'Outro';
  // Define the details with proper typing
  const details = typeof row.details === 'object' ? row.details : {};
  
  return {
    id: row.id,
    event,
    description: details,
    time: new Date(row.date.toString()),
  };
});

// Fix for accessing details.uuid property
console.log(recentEvents[4].details);
// Safely access the UUID with type checking
const eventDetails = recentEvents[4].details;
const eventUuid = typeof eventDetails === 'object' && eventDetails !== null ? (eventDetails as any).uuid : undefined;
console.log(chips.filter(chip => chip.uuid === eventUuid));

// Mock data for the dashboard, to be replaced with real data later
const mockData = {
  assets: {
    chips: chips.length,
    routers: routers.length,
    switches: switches.length
  },
  activeClients: activeClients,
  problemAssets: chipsComProblema.length,
  recentAssets: recentAssets,
  recentEvents: mappedRecentEvents
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
            {mockData.recentAssets.map(asset => <div key={asset.uuid} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                {asset.type_id === 2 && <Wifi className="h-4 w-4 text-[#4D2BFB]" />}
                {asset.type_id === 1 && <Smartphone className="h-4 w-4 text-[#4D2BFB]" />}
                {asset.solution_id === 7 && <Server className="h-4 w-4 text-[#4D2BFB]" />}
                <div>
                  {asset.type_id === 1}
                  <p className="text-sm font-medium">{asset.line_number}</p>
                  <p className="text-xs text-muted-foreground">{asset.iccid}</p>
                  {asset.type_id === 2}
                  <p className="text-sm font-medium">{asset.radio}</p>
                  <p className="text-xs text-muted-foreground">{asset.serial_number}</p>
                </div>
              </div>
              <div>
                {/* Fix for TS2362 & TS2363: Convert date strings to numbers for calculation */}
                <p className="text-xs text-muted-foreground">
                  {Math.ceil(Math.abs(new Date().getTime() - new Date(asset.created_at).getTime()) / (1000 * 3600))} Horas atrás
                </p>
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
            {mockData.recentEvents.map(event => {
              // Safe casting of description which is now a properly typed object
              const desc = event.description as any;
              
              return (
                <div key={event.id} className="flex gap-3 border-b pb-2 last:border-0 last:pb-0">
                  <div className={`h-2 w-2 mt-2 rounded-full 
                    ${event.event === 'INSERT' ? 'bg-green-500' : event.event === 'STATUS ATUALIZADO' ? 'bg-blue-500' : event.event === 'Alteração de Status' ? 'bg-amber-500' : event.event === 'Manutenção' ? 'bg-purple-500' : 'bg-red-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {desc && desc.iccid ? 
                        chips.filter((chip) => chip.iccid === desc.iccid)[0]?.line_number : 
                        desc?.radio}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{event.event}</span>
                      {/* Fix for TS2362 & TS2363: Convert date objects to numbers for calculation */}
                      <span className="text-xs text-muted-foreground">
                        {Math.ceil(Math.abs(new Date().getTime() - event.time.getTime()) / (1000 * 3600))} Horas atrás
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>;
};
export default Home;
