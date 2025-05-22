
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  Smartphone, 
  HardDrive, 
  AlertCircle,
  CheckCircle2,
  XCircle, 
  Clock 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingState, ErrorState } from "@/components/dashboard";
import { formatRelativeTime } from "@/utils/dashboardUtils";

// Status ID constants for more readable code
const STATUS_ID = {
  DISPONIVEL: 1,
  ALUGADO: 2,
  ASSINATURA: 3,
  SEM_DADOS: 4,
  BLOQUEADO: 5,
  MANUTENCAO: 6
};

// Solution ID for chips
const SOLUTION_ID = {
  CHIP: 11
};

// Problem status IDs
const PROBLEM_STATUS_IDS = [STATUS_ID.BLOQUEADO, STATUS_ID.MANUTENCAO];

// Custom hook for fetching asset data
const useAssetStats = () => {
  return useQuery({
    queryKey: ["assets-stats"],
    queryFn: async () => {
      console.log("Fetching asset stats data...");
      // Get all assets with their status and solution info
      const { data: assets, error } = await supabase
        .from('assets')
        .select(`
          uuid,
          status_id,
          solution_id,
          iccid,
          line_number,
          radio,
          serial_number,
          model,
          status:asset_status(status),
          solucao:asset_solutions(solution)
        `)
        .is('deleted_at', null);
      
      if (error) {
        console.error("Error fetching assets:", error);
        throw new Error("Falha ao carregar dados dos ativos");
      }

      console.log("Received asset data:", assets);

      // Separate chips and equipment
      const chips = assets?.filter(asset => asset.solution_id === SOLUTION_ID.CHIP) || [];
      const equipment = assets?.filter(asset => asset.solution_id !== SOLUTION_ID.CHIP) || [];
      
      // Calculate stats for chips
      const availableChips = chips.filter(chip => chip.status_id === STATUS_ID.DISPONIVEL);
      const unavailableChips = chips.filter(chip => chip.status_id !== STATUS_ID.DISPONIVEL);
      const problemChips = chips.filter(chip => PROBLEM_STATUS_IDS.includes(chip.status_id));
      
      // Calculate stats for equipment
      const availableEquipment = equipment.filter(eq => eq.status_id === STATUS_ID.DISPONIVEL);
      const unavailableEquipment = equipment.filter(eq => eq.status_id !== STATUS_ID.DISPONIVEL);
      const problemEquipment = equipment.filter(eq => PROBLEM_STATUS_IDS.includes(eq.status_id));
      
      return {
        chips: {
          total: chips.length,
          available: availableChips.length,
          unavailable: unavailableChips.length,
          problems: problemChips,
        },
        equipment: {
          total: equipment.length,
          available: availableEquipment.length,
          unavailable: unavailableEquipment.length,
          problems: problemEquipment,
        },
        rawData: {
          chips,
          equipment
        }
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Custom hook for fetching recent activities
const useRecentActivities = () => {
  return useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      console.log("Fetching recent activities...");
      const { data, error } = await supabase
        .from('asset_logs')
        .select('*')
        .order('date', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Error fetching activities:", error);
        throw new Error("Falha ao carregar dados de atividades recentes");
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Component for displaying asset count (total, available, unavailable)
const AssetCountCard = ({ 
  title, 
  total, 
  available, 
  unavailable, 
  icon: Icon, 
  iconColor 
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className={`p-2 rounded-full ${iconColor} bg-opacity-20`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{total}</div>
        <p className="text-muted-foreground mt-1">Total de ativos</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="flex items-center">
          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm">{available} Disponíveis</span>
        </div>
        <div className="flex items-center">
          <XCircle className="h-4 w-4 text-red-500 mr-1" />
          <span className="text-sm">{unavailable} Indisponíveis</span>
        </div>
      </CardFooter>
    </Card>
  );
};

// Component for displaying problems with assets
const ProblemAssetsCard = ({ title, problems, icon: Icon, iconColor }) => {
  if (!problems || problems.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <div className={`p-2 rounded-full ${iconColor} bg-opacity-20`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">0</div>
          <p className="text-muted-foreground mt-1">Nenhum problema encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className={`p-2 rounded-full ${iconColor} bg-opacity-20`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <div className="text-3xl font-bold">{problems.length}</div>
          <AlertCircle className="h-5 w-5 text-yellow-500 ml-2" />
        </div>
        <p className="text-muted-foreground mt-1">
          {problems.length === 1 ? 'Problema detectado' : 'Problemas detectados'}
        </p>
      </CardContent>
      <Separator className="my-2" />
      <CardContent className="pt-0 max-h-60 overflow-y-auto">
        <ul className="space-y-2">
          {problems.map((asset) => (
            <li key={asset.uuid} className="text-sm border-l-2 border-yellow-500 pl-3 py-1">
              <div className="font-medium">
                {asset.iccid || asset.radio || asset.serial_number || "Sem identificador"}
              </div>
              <div className="text-muted-foreground">
                Status: {asset.status?.status || "Desconhecido"}
              </div>
              <div className="text-xs text-muted-foreground">
                {asset.model || asset.line_number ? 
                  `${asset.model || ''} ${asset.line_number ? `#${asset.line_number}` : ''}` : 
                  "Sem detalhes adicionais"}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

// Component for a mini summary of recent activities
const RecentActivitiesPanel = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhuma atividade recente registrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Atividades Recentes</CardTitle>
        <CardDescription>Últimas 5 operações no sistema</CardDescription>
      </CardHeader>
      <CardContent className="max-h-80 overflow-y-auto">
        <ul className="space-y-3">
          {activities.map((activity) => {
            // Extract asset info from details if available
            const details = activity.details && typeof activity.details === 'object' ? activity.details : {};
            const assetId = typeof details === 'object' && 'asset_id' in details ? details.asset_id : null;
            const clientId = typeof details === 'object' && 'client_id' in details ? details.client_id : null;
            
            return (
              <li key={activity.id} className="flex items-start gap-3 border-b pb-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{activity.event || "Evento"}</p>
                  <p className="text-sm text-muted-foreground">
                    {assetId ? `Ativo: ${assetId}` : ''}
                    {assetId && clientId ? ' • ' : ''}
                    {clientId ? `Cliente: ${clientId}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.date ? formatRelativeTime(new Date(activity.date)) : 'Data desconhecida'}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

// Main Home component
const Home = () => {
  const { data: assetStats, isLoading: assetsLoading, isError: assetsError } = useAssetStats();
  const { data: recentActivities, isLoading: activitiesLoading } = useRecentActivities();
  
  // Loading state
  if (assetsLoading) {
    return (
      <div className="container mx-auto py-6">
        <PageBreadcrumbs />
        <LoadingState message="Carregando dados do painel..." />
      </div>
    );
  }
  
  // Error state
  if (assetsError) {
    return (
      <div className="container mx-auto py-6">
        <PageBreadcrumbs />
        <ErrorState message="Falha ao carregar dados. Por favor, tente novamente." />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <PageBreadcrumbs />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Chips Card */}
        <AssetCountCard 
          title="Total de Chips" 
          total={assetStats?.chips.total || 0}
          available={assetStats?.chips.available || 0}
          unavailable={assetStats?.chips.unavailable || 0}
          icon={Smartphone}
          iconColor="text-blue-500"
        />
        
        {/* Equipment Card */}
        <AssetCountCard 
          title="Total de Equipamentos"
          total={assetStats?.equipment.total || 0}
          available={assetStats?.equipment.available || 0}
          unavailable={assetStats?.equipment.unavailable || 0}
          icon={HardDrive}
          iconColor="text-purple-500"
        />
        
        {/* Problem Chips Card */}
        <ProblemAssetsCard 
          title="Chips com Problemas"
          problems={assetStats?.chips.problems || []}
          icon={AlertCircle}
          iconColor="text-yellow-500"
        />
        
        {/* Problem Equipment Card */}
        <ProblemAssetsCard 
          title="Equipamentos com Problemas"
          problems={assetStats?.equipment.problems || []}
          icon={AlertCircle}
          iconColor="text-orange-500"
        />
      </div>
      
      {/* Recent Activities Panel */}
      <div className="mt-8">
        <RecentActivitiesPanel 
          activities={recentActivities} 
        />
      </div>
      
      {/* Footer with last sync time */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background px-6 py-3 flex justify-between items-center text-sm text-muted-foreground mt-8">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Última sincronização: {new Date().toLocaleTimeString()}</span>
        </div>
        <div>
          <span>BLUE Platform v1.0.2</span>
        </div>
        <div>
          <a href="#" className="text-primary hover:underline">Changelog</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
