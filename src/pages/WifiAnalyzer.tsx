import React, { useState, useEffect } from "react";
import { useAssets } from "@/context/AssetProvider";
import { Asset, EquipamentAsset, Client } from "@/types/asset";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Shield,
  Wifi,
  Signal,
  Clock,
  CheckCircle2,
  Search,
  RefreshCw,
} from "lucide-react";

const WifiAnalyzer = () => {
  const { assets, clients, getClientById, updateAsset } = useAssets();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Get all router assets
  const routerAssets = assets.filter((asset): asset is EquipamentAsset => 
    asset.type === "ROTEADOR"
  );
  
  // Get routers with weak passwords
  const weakPasswordRouters = routerAssets.filter(router => 
    router.hasWeakPassword || router.needsPasswordChange
  );
  
  // Get routers that need analysis
  const needsAnalysisRouters = routerAssets.filter(router => 
    !router.wifiAnalysis || 
    (router.wifiAnalysis && 
     new Date().getTime() - new Date(router.wifiAnalysis.lastUpdated).getTime() > 24 * 60 * 60 * 1000)
  );
  
  // Filter routers based on active tab and search term
  const getFilteredRouters = () => {
    let filtered: EquipamentAsset[] = [];
    
    switch (activeTab) {
      case "all":
        filtered = routerAssets;
        break;
      case "weak-passwords":
        filtered = weakPasswordRouters;
        break;
      case "needs-analysis":
        filtered = needsAnalysisRouters;
        break;
      case "online":
        filtered = routerAssets.filter(router => router.isOnline);
        break;
      default:
        filtered = routerAssets;
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(router => {
        const client = getClientById(router.clientId || "");
        return (
          router.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          router.ssid.toLowerCase().includes(searchTerm.toLowerCase()) ||
          router.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          router.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client && client.nome.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }
    
    return filtered;
  };
  
  const filteredRouters = getFilteredRouters();
  
  // Simulate WiFi analysis for a router
  const runWifiAnalysis = async (router: EquipamentAsset) => {
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock analysis data
    const mockAnalysis = {
      signalStrength: Math.floor(Math.random() * 40) + 60, // 60-100%
      latency: Math.floor(Math.random() * 30) + 10, // 10-40ms
      transmissionSpeed: Math.floor(Math.random() * 500) + 100, // 100-600 Mbps
      interference: Math.floor(Math.random() * 50), // 0-50%
      connectedDevices: Math.floor(Math.random() * 15) + 1, // 1-15 devices
      lastUpdated: new Date().toISOString()
    };
    
    updateAsset(router.id, {
      wifiAnalysis: mockAnalysis
    });
  };
  
  // Get signal strength badge
  const getSignalStrengthBadge = (strength: number) => {
    if (strength >= 80) {
      return <Badge className="bg-green-500">Excelente ({strength}%)</Badge>;
    } else if (strength >= 60) {
      return <Badge className="bg-yellow-500">Bom ({strength}%)</Badge>;
    } else if (strength >= 40) {
      return <Badge className="bg-orange-500">Regular ({strength}%)</Badge>;
    } else {
      return <Badge className="bg-red-500">Fraco ({strength}%)</Badge>;
    }
  };
  
  // Get security status badge
  const getSecurityStatusBadge = (router: EquipamentAsset) => {
    if (router.hasWeakPassword || router.needsPasswordChange) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Inseguro
      </Badge>;
    } else {
      return <Badge className="bg-green-500 flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Seguro
      </Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analisador de WiFi</h1>
          <p className="text-muted-foreground">
            Monitore e analise a performance dos roteadores em campo
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Roteadores</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routerAssets.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Senhas Fracas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{weakPasswordRouters.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Signal className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {routerAssets.filter(r => r.isOnline).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisam de Análise</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{needsAnalysisRouters.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar roteador ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">
            Todos ({routerAssets.length})
          </TabsTrigger>
          <TabsTrigger value="weak-passwords">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Senhas Fracas ({weakPasswordRouters.length})
            </div>
          </TabsTrigger>
          <TabsTrigger value="needs-analysis">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Análise Pendente ({needsAnalysisRouters.length})
            </div>
          </TabsTrigger>
          <TabsTrigger value="online">
            <div className="flex items-center gap-1">
              <Signal className="h-3 w-3" />
              Online
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {filteredRouters.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Identificação</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>SSID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Segurança</TableHead>
                        <TableHead>Sinal</TableHead>
                        <TableHead>Última Análise</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRouters.map((router) => {
                        const client = getClientById(router.clientId || "");
                        return (
                          <TableRow key={router.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{router.uniqueId}</div>
                                <div className="text-sm text-gray-500">
                                  {router.brand} {router.model}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {client ? (
                                <div>
                                  <div className="font-medium">{client.nome}</div>
                                  <div className="text-sm text-gray-500">{client.cnpj}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">Não associado</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-mono text-sm">{router.ssid}</div>
                            </TableCell>
                            <TableCell>
                              {router.isOnline ? (
                                <Badge className="bg-green-500">Online</Badge>
                              ) : (
                                <Badge variant="secondary">Offline</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {getSecurityStatusBadge(router)}
                            </TableCell>
                            <TableCell>
                              {router.wifiAnalysis ? 
                                getSignalStrengthBadge(router.wifiAnalysis.signalStrength) :
                                <Badge variant="outline">Não analisado</Badge>
                              }
                            </TableCell>
                            <TableCell>
                              {router.wifiAnalysis ? (
                                <div className="text-sm">
                                  {new Date(router.wifiAnalysis.lastUpdated).toLocaleDateString("pt-BR")}
                                  <div className="text-xs text-gray-500">
                                    {new Date(router.wifiAnalysis.lastUpdated).toLocaleTimeString("pt-BR")}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">Nunca</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => runWifiAnalysis(router)}
                                disabled={!router.isOnline}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <CheckCircle2 className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-center text-gray-500">
                    Nenhum roteador encontrado com os filtros atuais.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WifiAnalyzer;
