import { useAssets } from "@/context/useAssets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Smartphone, Wifi, CheckCircle, AlertCircle, XCircle, Clock, FileSpreadsheet, Calendar, ArrowRight } from "lucide-react";
import { exportToExcel } from "@/utils/excelExport";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import AssetsStatusCard from "@/components/dashboard/AssetsStatusCard"; 
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const {
    assets,
    clients,
    getAssetsByType,
    getAssetsByStatus,
    getExpiredSubscriptions,
    loading: assetsLoading // Fixed property name from isLoading to loading
  } = useAssets();
  
  const navigate = useNavigate();
  
  // Only compute these values when assets are loaded
  const totalChips = !assetsLoading ? getAssetsByType("CHIP").length : 0;
  const totalRouters = !assetsLoading ? getAssetsByType("ROTEADOR").length : 0;
  const availableChips = !assetsLoading ? getAssetsByType("CHIP").filter(chip => chip.status === "DISPONÍVEL").length : 0;
  const availableRouters = !assetsLoading ? getAssetsByType("ROTEADOR").filter(router => router.status === "DISPONÍVEL").length : 0;
  const problemAssets = !assetsLoading ? assets.filter(asset => ["SEM DADOS", "BLOQUEADO", "MANUTENÇÃO"].includes(asset.status)) : [];
  const expiredSubscriptions = !assetsLoading ? getExpiredSubscriptions() : [];
  
  const handleExportToExcel = () => {
    exportToExcel({
      assets,
      clients
    });
  };

  function formatNumber(number) {
    // número = +5599999999999
    const cleaned = ('' + number).replace(/\D/g, '');
    // número = 5599999999999
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{4}|\d{5})(\d{4})$/);
    // número = 55 99 99999 9999
    if (match) {
      return ['(', match[2], ') ', match[3], '-', match[4]].join('')
    }
    // número = (99) 99999-9999
    return '';
  }

  // Loading state - show skeleton UI
  if (assetsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <Skeleton className="h-9 w-44" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i} className="col-span-1">
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3].map(j => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleExportToExcel}>
            <FileSpreadsheet className="h-4 w-4" />
            Exportar para Excel
          </Button>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Atualizado: {new Date().toLocaleString('pt-BR')}
          </Badge>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Chips</CardTitle>
            <Smartphone className="h-4 w-4 text-telecom-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChips}</div>
            <p className="text-xs text-muted-foreground">
              {availableChips} disponíveis
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Roteadores</CardTitle>
            <Wifi className="h-4 w-4 text-telecom-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRouters}</div>
            <p className="text-xs text-muted-foreground">
              {availableRouters} disponíveis
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos em Uso</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assets.filter(asset => ["ALUGADO", "ASSINATURA"].includes(asset.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Alugados ou em assinatura
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos com Problema</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{problemAssets.length}</div>
            <p className="text-xs text-muted-foreground">
              Necessitam atenção
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ativos com Problema</CardTitle>
            <CardDescription>
              Ativos que precisam de atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            {problemAssets.length > 0 ? <div className="space-y-2">
                {problemAssets.slice(0, 5).map(asset => <div key={asset.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center space-x-2">
                      {asset.type === "CHIP" ? <Smartphone className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
                      <div>
                        <p className="text-sm font-medium">
                          {asset.type === "CHIP" ? formatNumber(`+55${(asset as any).phoneNumber}`) : (asset as any).radio}
                        </p>
                        <p className="text-xs text-gray-500">
                          {asset.type === "CHIP" ? (asset as any).iccid : (asset as any).serialNumber}
                        </p>
                      </div>
                    </div>
                    <Badge className={asset.status === "SEM DADOS" ? "bg-amber-500" : asset.status === "BLOQUEADO" ? "bg-red-500" : "bg-blue-500"}>
                      {asset.status}
                    </Badge>
                  </div>)}
                {problemAssets.length > 5 && <p className="text-xs text-center text-gray-500 mt-2">
                    + {problemAssets.length - 5} outros ativos com problema
                  </p>}
              </div> : <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <CheckCircle className="h-8 w-8 mb-2" />
                <p className="text-sm">Não há ativos com problema</p>
              </div>}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Assinaturas Expiradas</CardTitle>
              
            </div>
            <Button variant="outline" size="sm" className="flex items-center" onClick={() => navigate("/subscriptions")}>
              Ver todas <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {expiredSubscriptions.length > 0 ? <div className="space-y-2">
                {expiredSubscriptions.slice(0, 5).map(asset => {
              const client = asset.clientId ? clients.find(c => c.id === asset.clientId) : null;
              return <div key={asset.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center space-x-2">
                        {asset.type === "CHIP" ? <Smartphone className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
                        <div>
                          <p className="text-sm font-medium">
                            {asset.type === "CHIP" ? `CHIP: ${(asset as any).phoneNumber}` : `ROTEADOR: ${(asset as any).model}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {client?.nome || "Cliente não encontrado"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-red-500">
                          Expirado
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {asset.subscription ? format(new Date(asset.subscription.endDate), "dd/MM/yyyy") : ""}
                        </p>
                      </div>
                    </div>;
            })}
                {expiredSubscriptions.length > 5 && <p className="text-xs text-center text-gray-500 mt-2">
                    + {expiredSubscriptions.length - 5} outras assinaturas expiradas
                  </p>}
              </div> : <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <Calendar className="h-8 w-8 mb-2" />
                <p className="text-sm">Nenhuma assinatura expirada</p>
              </div>}
          </CardContent>
        </Card>
        
        <AssetsStatusCard/>
      </div>
    </div>;
};
export default Dashboard;
