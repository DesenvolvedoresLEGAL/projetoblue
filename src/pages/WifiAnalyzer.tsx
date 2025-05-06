
import { useState } from "react";
import { useAssets } from "@/context/AssetContext";
import { RouterAsset } from "@/types/asset";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  ArrowDownUp, 
  Activity, 
  Zap, 
  Signal, 
  Smartphone
} from "lucide-react";

// Mock data generator for WiFi analysis
const generateMockWifiAnalysis = (routers: RouterAsset[]) => {
  return routers.map(router => {
    return {
      ...router,
      isOnline: Math.random() > 0.2, // 80% chance to be online
      lastSeen: new Date().toISOString(),
      wifiAnalysis: {
        signalStrength: Math.floor(Math.random() * 100),
        latency: Math.floor(Math.random() * 100),
        transmissionSpeed: Math.floor(Math.random() * 300),
        interference: Math.floor(Math.random() * 100),
        connectedDevices: Math.floor(Math.random() * 10),
        lastUpdated: new Date().toISOString()
      }
    };
  });
};

export default function WifiAnalyzer() {
  const { assets, clients, getClientById } = useAssets();
  const [selectedRouterId, setSelectedRouterId] = useState<string | null>(null);

  // Filter only routers with clients
  const routersWithClients = assets
    .filter(asset => asset.type === "ROTEADOR" && asset.clientId)
    .map(router => router as RouterAsset);
  
  // Add mock data
  const routersWithAnalysis = generateMockWifiAnalysis(routersWithClients);
  
  // Selected router
  const selectedRouter = selectedRouterId 
    ? routersWithAnalysis.find(router => router.id === selectedRouterId) 
    : null;
  
  // Client of the selected router
  const selectedClient = selectedRouter?.clientId 
    ? getClientById(selectedRouter.clientId) 
    : null;

  // Generate radar data for the selected router
  const getRadarData = (router: RouterAsset) => {
    if (!router.wifiAnalysis) return [];
    
    return [
      { subject: 'Sinal', A: router.wifiAnalysis.signalStrength, fullMark: 100 },
      { subject: 'Velocidade', A: router.wifiAnalysis.transmissionSpeed / 3, fullMark: 100 },
      { subject: 'Latência', A: 100 - router.wifiAnalysis.latency, fullMark: 100 },
      { subject: 'Estabilidade', A: 100 - router.wifiAnalysis.interference, fullMark: 100 },
      { subject: 'Capacidade', A: Math.min(100, 100 - (router.wifiAnalysis.connectedDevices * 10)), fullMark: 100 },
    ];
  };

  // Get quality status
  const getQualityStatus = (value: number) => {
    if (value >= 80) return { label: "Excelente", color: "bg-green-100 text-green-800" };
    if (value >= 60) return { label: "Bom", color: "bg-blue-100 text-blue-800" };
    if (value >= 40) return { label: "Regular", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Ruim", color: "bg-red-100 text-red-800" };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">WiFi Analyzer</h1>
        <p className="text-gray-500">Análise de desempenho dos roteadores ativos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Online routers */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Wifi className="h-5 w-5 text-green-500 mr-2" />
              <CardTitle className="text-sm font-medium">Roteadores Online</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routersWithAnalysis.filter(router => router.isOnline).length}
            </div>
            <p className="text-xs text-gray-500">
              de {routersWithAnalysis.length} roteadores monitorados
            </p>
          </CardContent>
        </Card>
        
        {/* Offline routers */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <WifiOff className="h-5 w-5 text-red-500 mr-2" />
              <CardTitle className="text-sm font-medium">Roteadores Offline</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routersWithAnalysis.filter(router => !router.isOnline).length}
            </div>
            <p className="text-xs text-gray-500">
              de {routersWithAnalysis.length} roteadores monitorados
            </p>
          </CardContent>
        </Card>
        
        {/* Average signal strength */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Signal className="h-5 w-5 text-blue-500 mr-2" />
              <CardTitle className="text-sm font-medium">Qualidade Média de Sinal</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                routersWithAnalysis
                  .filter(router => router.isOnline && router.wifiAnalysis)
                  .reduce((sum, router) => sum + (router.wifiAnalysis?.signalStrength || 0), 0) / 
                Math.max(1, routersWithAnalysis.filter(router => router.isOnline && router.wifiAnalysis).length)
              )}%
            </div>
            <p className="text-xs text-gray-500">
              Média de sinal dos roteadores online
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Router list */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Roteadores Monitorados</CardTitle>
            <CardDescription>
              Selecione um roteador para ver detalhes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Router</TableHead>
                    <TableHead>Cliente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routersWithAnalysis.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                        Nenhum roteador encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    routersWithAnalysis.map((router) => {
                      const client = router.clientId ? getClientById(router.clientId) : null;
                      return (
                        <TableRow 
                          key={router.id}
                          className={`cursor-pointer ${selectedRouterId === router.id ? "bg-blue-50" : ""}`}
                          onClick={() => setSelectedRouterId(router.id)}
                        >
                          <TableCell>
                            {router.isOnline ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Wifi className="h-3 w-3 mr-1" />
                                Online
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <WifiOff className="h-3 w-3 mr-1" />
                                Offline
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{router.brand} {router.model}</TableCell>
                          <TableCell>{client?.name || "—"}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Router detail */}
        <Card className="lg:col-span-2">
          {selectedRouter ? (
            <>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>
                      {selectedRouter.brand} {selectedRouter.model}
                    </CardTitle>
                    <CardDescription>
                      {selectedClient ? (
                        <span>Cliente: {selectedClient.name}</span>
                      ) : (
                        <span>Sem cliente associado</span>
                      )}
                    </CardDescription>
                  </div>
                  {selectedRouter.isOnline ? (
                    <Badge className="bg-green-100 text-green-800">
                      <Wifi className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Offline
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="w-full">
                    <TabsTrigger value="overview" className="flex-1">Visão Geral</TabsTrigger>
                    <TabsTrigger value="details" className="flex-1">Detalhes</TabsTrigger>
                    <TabsTrigger value="radar" className="flex-1">Gráfico</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">SSID</div>
                        <div className="font-medium">{selectedRouter.ssid}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Senha</div>
                        <div className="font-medium">{selectedRouter.password}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">IP de Gerência</div>
                        <div className="font-medium">{selectedRouter.ipAddress || "—"}</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Identidade Única</div>
                        <div className="font-medium">{selectedRouter.uniqueId}</div>
                      </div>
                      <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Último sinal</div>
                        <div className="font-medium">
                          {selectedRouter.lastSeen ? new Date(selectedRouter.lastSeen).toLocaleString() : "—"}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="pt-4">
                    {selectedRouter.wifiAnalysis ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                          <Signal className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <div className="text-xs text-gray-500">Força do Sinal</div>
                            <div className="font-medium">
                              {selectedRouter.wifiAnalysis.signalStrength}%
                            </div>
                            <Badge className={getQualityStatus(selectedRouter.wifiAnalysis.signalStrength).color}>
                              {getQualityStatus(selectedRouter.wifiAnalysis.signalStrength).label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                          <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                          <div>
                            <div className="text-xs text-gray-500">Latência</div>
                            <div className="font-medium">
                              {selectedRouter.wifiAnalysis.latency} ms
                            </div>
                            <Badge className={getQualityStatus(100 - selectedRouter.wifiAnalysis.latency).color}>
                              {getQualityStatus(100 - selectedRouter.wifiAnalysis.latency).label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                          <ArrowDownUp className="h-5 w-5 text-green-500 mr-3" />
                          <div>
                            <div className="text-xs text-gray-500">Velocidade de Transmissão</div>
                            <div className="font-medium">
                              {selectedRouter.wifiAnalysis.transmissionSpeed} Mbps
                            </div>
                            <Badge className={getQualityStatus(selectedRouter.wifiAnalysis.transmissionSpeed / 3).color}>
                              {getQualityStatus(selectedRouter.wifiAnalysis.transmissionSpeed / 3).label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                          <Activity className="h-5 w-5 text-red-500 mr-3" />
                          <div>
                            <div className="text-xs text-gray-500">Interferência</div>
                            <div className="font-medium">
                              {selectedRouter.wifiAnalysis.interference}%
                            </div>
                            <Badge className={getQualityStatus(100 - selectedRouter.wifiAnalysis.interference).color}>
                              {getQualityStatus(100 - selectedRouter.wifiAnalysis.interference).label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                          <Smartphone className="h-5 w-5 text-purple-500 mr-3" />
                          <div>
                            <div className="text-xs text-gray-500">Dispositivos Conectados</div>
                            <div className="font-medium">
                              {selectedRouter.wifiAnalysis.connectedDevices}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                          <Zap className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <div className="text-xs text-gray-500">Qualidade Geral</div>
                            <div className="font-medium">
                              {Math.round((
                                selectedRouter.wifiAnalysis.signalStrength + 
                                (100 - selectedRouter.wifiAnalysis.latency) + 
                                (selectedRouter.wifiAnalysis.transmissionSpeed / 3) + 
                                (100 - selectedRouter.wifiAnalysis.interference)
                              ) / 4)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Dados de análise não disponíveis para este roteador.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="radar" className="pt-4">
                    {selectedRouter.wifiAnalysis ? (
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData(selectedRouter)}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar
                              name="Qualidade"
                              dataKey="A"
                              stroke="#1E88E5"
                              fill="#1E88E5"
                              fillOpacity={0.6}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Dados de análise não disponíveis para este roteador.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <Wifi className="h-16 w-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Nenhum roteador selecionado</h3>
              <p className="text-sm text-center">
                Selecione um roteador na lista para visualizar detalhes da análise WiFi.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
