
import { useAssets } from "@/context/useAssets";
import { AssetStatus, EquipamentAsset } from "@/types/asset";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, WifiOff, Wrench, Smartphone, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Define monitoring status configurations for assets that need attention
const monitoringStatusConfig: Partial<Record<AssetStatus, { color: string; icon: React.ReactNode; description: string }>> = {
  "SEM DADOS": { 
    color: "bg-gray-100 text-gray-700", 
    icon: <WifiOff className="h-5 w-5" />,
    description: "Ativos sem conectividade ou dados"
  },
  "BLOQUEADO": { 
    color: "bg-red-100 text-red-700", 
    icon: <AlertTriangle className="h-5 w-5" />,
    description: "Ativos bloqueados ou com problema"
  },
  "MANUTENÇÃO": { 
    color: "bg-yellow-100 text-yellow-700", 
    icon: <Wrench className="h-5 w-5" />,
    description: "Ativos em manutenção"
  }
};

// Only include statuses that require monitoring/attention
const monitoringStatuses: AssetStatus[] = ["SEM DADOS", "BLOQUEADO", "MANUTENÇÃO"];

// Function to check for routers that need SSID/password update
const getRoutersNeedingUpdate = (assets: EquipamentAsset[]) => {
  return assets.filter(router => 
    router.status === "DISPONÍVEL" && router.needsPasswordChange === true
  );
};

export default function Monitoring() {
  const { assets, getAssetsByStatus, getClientById } = useAssets();
  const navigate = useNavigate();
  
  // Get assets that need monitoring
  const assetsNeedingAttention = assets.filter(asset => 
    monitoringStatuses.includes(asset.status)
  );
  
  // Get routers that need SSID/password update
  const routersNeedingUpdate = getRoutersNeedingUpdate(
    assets.filter(asset => asset.type === "ROTEADOR") as EquipamentAsset[]
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Monitoramento de Ativos</h1>
        <p className="text-gray-500">Monitore ativos que necessitam atenção especial</p>
      </div>

      {/* Alert for critical assets */}
      {assetsNeedingAttention.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription>
            Existem {assetsNeedingAttention.length} ativos que precisam de atenção.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Alert for routers that need update */}
      {routersNeedingUpdate.length > 0 && (
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ação Necessária!</AlertTitle>
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <p>Existem {routersNeedingUpdate.length} roteadores que retornaram ao estoque e precisam ter o SSID e senha atualizados.</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-white self-start"
                onClick={() => navigate("/inventory")}
              >
                Ir para Inventário
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Assets by Status Tabs */}
      <Tabs defaultValue={monitoringStatuses[0]}>
        <TabsList className="grid grid-cols-3">
          {monitoringStatuses.map((status) => (
            <TabsTrigger key={status} value={status}>
              {status}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {monitoringStatuses.map((status) => {
          const config = monitoringStatusConfig[status];
          if (!config) return null;
          
          return (
            <TabsContent key={status} value={status}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${config.color}`}>
                      {config.icon}
                    </div>
                    <div>
                      <CardTitle>{status}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Detalhes</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Data de Registro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getAssetsByStatus(status).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            Nenhum ativo encontrado com este status.
                          </TableCell>
                        </TableRow>
                      ) : (
                        getAssetsByStatus(status).map((asset) => {
                          const client = asset.clientId ? getClientById(asset.clientId) : null;
                          return (
                            <TableRow key={asset.id}>
                              <TableCell className="font-medium">{asset.id.substring(0, 8)}</TableCell>
                              <TableCell>{asset.type}</TableCell>
                              <TableCell>
                                {asset.type === "CHIP" ? 
                                  `${(asset as any).carrier} - ${(asset as any).phoneNumber}` : 
                                  `${(asset as any).brand} ${(asset as any).model}`
                                }
                              </TableCell>
                              <TableCell>
                                {client ? client.nome : "—"}
                              </TableCell>
                              <TableCell>{new Date(asset.registrationDate).toLocaleDateString()}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
