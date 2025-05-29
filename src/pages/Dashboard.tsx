
import React, { useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Smartphone, Wifi, CheckCircle, AlertCircle, XCircle, Clock, FileSpreadsheet, Calendar, ArrowRight, Zap } from "lucide-react";
import { exportToExcel } from "@/utils/excelExport";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Query para buscar todos os ativos com suas relações
  const { data: assets, isLoading } = useQuery({
    queryKey: ["dashboard-assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select(`
          uuid,
          solution_id,
          status_id,
          serial_number,
          iccid,
          radio,
          line_number,
          model,
          rented_days,
          created_at,
          updated_at,
          manufacturer:manufacturers(id, name),
          status:asset_status(id, status),
          solution:asset_solutions(id, solution)
        `)
        .is("deleted_at", null);

      if (error) throw error;
      
      // Transformar dados para compatibilidade com AssetWithRelations
      return (data || []).map(asset => ({
        ...asset,
        plano: { id: null, nome: 'Não definido' }, // Valor padrão para compatibilidade
        solucao: {
          id: asset.solution?.id || 0,
          name: asset.solution?.solution || 'Desconhecido'
        }, // Mapear solution para solucao como objeto
        status: {
          id: asset.status?.id,
          name: asset.status?.status || 'Desconhecido' // Mapear status para name
        },
        manufacturer: {
          id: asset.manufacturer?.id,
          name: asset.manufacturer?.name || 'Desconhecido'
        }
      }));
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  // Query para buscar clientes (para funcionalidade de exportação)
  const { data: clients } = useQuery({
    queryKey: ["dashboard-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .is("deleted_at", null);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000
  });

  // Processar dados dos ativos por categoria
  const dashboardStats = useMemo(() => {
    if (!assets) return null;
    
    // Separar por categorias
    const chips = assets.filter(asset => asset.solution_id === 11);
    const speedys = assets.filter(asset => asset.solution_id === 1);
    const equipments = assets.filter(asset => asset.solution_id !== 11 && asset.solution_id !== 1);
    
    // Função para calcular métricas por categoria
    const calculateMetrics = (categoryAssets: typeof assets) => {
      const total = categoryAssets.length;
      const available = categoryAssets.filter(a => a.status_id === 1).length;
      const inUse = categoryAssets.filter(a => a.status_id === 2 || a.status_id === 3).length;
      const problems = categoryAssets.filter(a => a.status_id && a.status_id >= 4).length;
      const problemAssets = categoryAssets.filter(a => a.status_id && a.status_id >= 4);
      
      return { total, available, inUse, problems, problemAssets };
    };

    return {
      chips: calculateMetrics(chips),
      speedys: calculateMetrics(speedys),
      equipments: calculateMetrics(equipments),
      totalAssets: assets.length,
      totalProblems: assets.filter(a => a.status_id && a.status_id >= 4).length
    };
  }, [assets]);

  const handleExportToExcel = () => {
    if (assets) {
      exportToExcel(assets);
    }
  };

  // Função para formatar identificador do asset
  const getAssetIdentifier = (asset: any) => {
    if (asset.solution_id === 11) {
      return asset.line_number || asset.iccid || 'N/A';
    }
    return asset.radio || asset.serial_number || 'N/A';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <Skeleton className="h-9 w-44" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
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
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      
      {/* Cards principais por categoria */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Card CHIPS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CHIPS</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.chips.total}</div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium text-green-600">{dashboardStats.chips.available}</div>
                <div className="text-muted-foreground">Disponíveis</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">{dashboardStats.chips.inUse}</div>
                <div className="text-muted-foreground">Em uso</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{dashboardStats.chips.problems}</div>
                <div className="text-muted-foreground">Problemas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card SPEEDYS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SPEEDYS 5G</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.speedys.total}</div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium text-green-600">{dashboardStats.speedys.available}</div>
                <div className="text-muted-foreground">Disponíveis</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">{dashboardStats.speedys.inUse}</div>
                <div className="text-muted-foreground">Em uso</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{dashboardStats.speedys.problems}</div>
                <div className="text-muted-foreground">Problemas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card EQUIPAMENTOS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EQUIPAMENTOS</CardTitle>
            <Wifi className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.equipments.total}</div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium text-green-600">{dashboardStats.equipments.available}</div>
                <div className="text-muted-foreground">Disponíveis</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">{dashboardStats.equipments.inUse}</div>
                <div className="text-muted-foreground">Em uso</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{dashboardStats.equipments.problems}</div>
                <div className="text-muted-foreground">Problemas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards secundários */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Ativos com Problema */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ativos com Problema</CardTitle>
            <CardDescription>
              Ativos que precisam de atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardStats.totalProblems > 0 ? (
              <div className="space-y-2">
                {/* Problemas dos CHIPs */}
                {dashboardStats.chips.problemAssets.slice(0, 3).map(asset => (
                  <div key={asset.uuid} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">
                          CHIP: {getAssetIdentifier(asset)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {asset.iccid || 'Sem ICCID'}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-red-500">
                      {asset.status?.name || 'Problema'}
                    </Badge>
                  </div>
                ))}
                
                {/* Problemas dos SPEEDYs */}
                {dashboardStats.speedys.problemAssets.slice(0, 2).map(asset => (
                  <div key={asset.uuid} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">
                          SPEEDY: {getAssetIdentifier(asset)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {asset.serial_number || 'Sem Serial'}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-red-500">
                      {asset.status?.name || 'Problema'}
                    </Badge>
                  </div>
                ))}

                {dashboardStats.totalProblems > 5 && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    + {dashboardStats.totalProblems - 5} outros ativos com problema
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <CheckCircle className="h-8 w-8 mb-2" />
                <p className="text-sm">Não há ativos com problema</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Resumo Geral */}
        <Card className="col-span-1">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Resumo Geral</CardTitle>
              <CardDescription>Visão geral do inventário</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="flex items-center" onClick={() => navigate("/assets")}>
              Ver inventário <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total de Ativos</span>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {dashboardStats.totalAssets}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {dashboardStats.chips.available + dashboardStats.speedys.available + dashboardStats.equipments.available}
                  </div>
                  <p className="text-xs text-muted-foreground">Disponíveis</p>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {dashboardStats.chips.inUse + dashboardStats.speedys.inUse + dashboardStats.equipments.inUse}
                  </div>
                  <p className="text-xs text-muted-foreground">Em uso</p>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">
                    {dashboardStats.totalProblems}
                  </div>
                  <p className="text-xs text-muted-foreground">Problemas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
