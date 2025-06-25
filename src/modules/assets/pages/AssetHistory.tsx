
import React, { useState } from 'react';
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { StandardFiltersCard } from "@/components/ui/standard-filters-card";
import { AssetHistoryTable } from '@modules/assets/components/history/AssetHistoryTable';
import { useAssetHistory } from '@modules/assets/hooks/useAssetHistory';
import { History, Loader2 } from "lucide-react";
import { toast } from '@/utils/toast';
import { AssetHistoryEntry } from '@/types/assetHistory';

const AssetHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  
  const { data: historyData, isLoading, error, refetch } = useAssetHistory();

  if (error) {
    console.error('Erro ao carregar histórico:', error);
    toast.error('Erro ao carregar histórico de ativos');
  }

  // Filtrar dados baseado na pesquisa e evento selecionado
  const filteredHistory = React.useMemo(() => {
    if (!historyData) return [];
    
    return historyData.filter(entry => {
      const matchesSearch = !searchTerm || 
        entry.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEvent = !selectedEvent || entry.event === selectedEvent;
      
      return matchesSearch && matchesEvent;
    });
  }, [historyData, searchTerm, selectedEvent]);

  // Debug log
  React.useEffect(() => {
    console.log('AssetHistory - Dados carregados:', {
      total: historyData?.length || 0,
      filtrados: filteredHistory.length,
      isLoading,
      error: !!error
    });
  }, [historyData, filteredHistory, isLoading, error]);

  // Buscar eventos únicos para o filtro
  const uniqueEvents = React.useMemo(() => {
    if (!historyData) return [];
    
    const events = [...new Set(historyData.map(entry => entry.event).filter(Boolean))];
    return events.sort();
  }, [historyData]);

  const handleRefresh = () => {
    console.log('Atualizando histórico...');
    refetch();
    toast.success('Histórico atualizado');
  };

  // Converter dados para o formato esperado pela tabela
  const tableData: AssetHistoryEntry[] = React.useMemo(() => {
    return filteredHistory.map(entry => ({
      id: entry.id,
      assoc_id: null,
      date: entry.date,
      event: entry.event,
      details: entry.details,
      status_before_id: undefined,
      status_after_id: undefined,
      created_at: entry.date,
      updated_at: entry.date,
      deleted_at: undefined,
      // Campos para compatibilidade
      timestamp: entry.date,
      clientId: undefined,
      clientName: entry.client_name,
      assetIds: undefined,
      assets: undefined,
      operationType: 'ASSOCIATION',
      description: entry.description,
      comments: undefined
    }));
  }, [filteredHistory]);

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={History}
        title="Histórico de Ativos"
        description="Visualize o histórico completo de operações realizadas nos ativos do sistema"
        actions={[
          {
            label: "Atualizar",
            onClick: handleRefresh,
            variant: "outline" as const
          }
        ]}
      />

      <StandardFiltersCard 
        title="Filtros de Histórico"
        searchPlaceholder="Buscar por ativo, cliente ou descrição..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        additionalFilters={
          <div className="flex gap-4">
            <div className="min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Tipo de Evento
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4D2BFB] focus:border-transparent"
              >
                <option value="">Todos os eventos</option>
                {uniqueEvents.map(event => (
                  <option key={event} value={event}>
                    {event}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#4D2BFB]" />
          <span className="ml-2 text-gray-600">Carregando histórico...</span>
        </div>
      ) : (
        <AssetHistoryTable 
          data={tableData}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default AssetHistory;
