
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { StandardFiltersCard } from "@/components/ui/standard-filters-card";
import { StandardStatusBadge } from "@/components/ui/standard-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Search, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const AssetHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: historyData, isLoading, refetch } = useQuery({
    queryKey: ['asset-history', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('asset_logs')
        .select(`
          id,
          asset_id,
          user_id,
          action,
          old_values,
          new_values,
          created_at,
          assets:asset_id (
            uuid,
            serial_number,
            iccid,
            radio,
            model,
            solution:asset_solutions(solution),
            status:asset_status(status)
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm.trim()) {
        query = query.or(
          `asset_id.ilike.%${searchTerm}%,` +
          `action.ilike.%${searchTerm}%,` +
          `assets.serial_number.ilike.%${searchTerm}%,` +
          `assets.iccid.ilike.%${searchTerm}%,` +
          `assets.radio.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000
  });

  const handleRefresh = () => {
    refetch();
    toast.success("Histórico atualizado com sucesso!");
  };

  const formatEventType = (action: string) => {
    const eventMap: Record<string, string> = {
      'CREATE': 'Criado',
      'UPDATE': 'Atualizado',
      'DELETE': 'Removido',
      'STATUS_CHANGE': 'Status Alterado',
      'ASSOCIATION': 'Associação Criada',
      'DISASSOCIATION': 'Associação Removida'
    };
    return eventMap[action] || action;
  };

  const getAssetIdentifier = (asset: any) => {
    if (!asset) return 'N/A';
    return asset.iccid || asset.radio || asset.serial_number || asset.uuid;
  };

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={History}
        title="Histórico de Alterações"
        description="Auditoria e rastreabilidade completa de todas as operações realizadas nos ativos"
      >
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB] hover:text-white font-neue-haas"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </StandardPageHeader>

      <StandardFiltersCard title="Buscar no Histórico">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por ativo, ação ou identificador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
            />
          </div>
        </div>
      </StandardFiltersCard>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground font-neue-haas">
              Carregando histórico...
            </div>
          ) : historyData && historyData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#4D2BFB]/20">
                    <TableHead className="font-neue-haas font-bold text-[#020CBC]">Data/Hora</TableHead>
                    <TableHead className="font-neue-haas font-bold text-[#020CBC]">Ativo</TableHead>
                    <TableHead className="font-neue-haas font-bold text-[#020CBC]">Tipo</TableHead>
                    <TableHead className="font-neue-haas font-bold text-[#020CBC]">Evento</TableHead>
                    <TableHead className="font-neue-haas font-bold text-[#020CBC]">Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.map((log, index) => (
                    <TableRow 
                      key={log.id} 
                      className={`border-[#4D2BFB]/10 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-[#4D2BFB]/5`}
                    >
                      <TableCell className="font-neue-haas">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-neue-haas">
                        <div>
                          <div className="font-medium text-[#020CBC]">
                            {getAssetIdentifier(log.assets)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.assets?.model || 'Modelo não definido'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StandardStatusBadge 
                          status={log.assets?.solution?.solution || 'Desconhecido'} 
                          type="solution"
                        />
                      </TableCell>
                      <TableCell>
                        <StandardStatusBadge 
                          status={formatEventType(log.action)} 
                          type="event"
                        />
                      </TableCell>
                      <TableCell className="font-neue-haas text-sm text-muted-foreground">
                        {log.old_values || log.new_values ? (
                          <div className="max-w-xs">
                            {log.action === 'STATUS_CHANGE' && log.new_values ? 
                              `Status alterado` : 
                              'Alteração registrada'
                            }
                          </div>
                        ) : (
                          'Operação executada'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="text-muted-foreground font-neue-haas">
                {searchTerm ? 
                  `Nenhum registro encontrado para "${searchTerm}"` : 
                  'Nenhum registro de histórico encontrado'
                }
              </div>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                  className="border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB] hover:text-white font-neue-haas"
                >
                  Limpar Busca
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetHistory;
