
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { 
  CalendarRange, 
  FilterIcon,
  X
} from "lucide-react";
import { TimeRange, GroupByOption } from "@/types/dataUsage";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface UsageFiltersProps {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  groupBy: GroupByOption;
  setGroupBy: (groupBy: GroupByOption) => void;
  clientFilter: string;
  setClientFilter: (filter: string) => void;
  carrierFilter: string;
  setCarrierFilter: (filter: string) => void;
  regionFilter: string;
  setRegionFilter: (filter: string) => void;
  signalFilter: string;
  setSignalFilter: (filter: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  clearFilters: () => void;
  carriers: string[];
  clients: string[];
  regions: string[];
}

export const UsageFilters: React.FC<UsageFiltersProps> = ({
  timeRange,
  setTimeRange,
  groupBy,
  setGroupBy,
  clientFilter,
  setClientFilter,
  carrierFilter,
  setCarrierFilter,
  regionFilter,
  setRegionFilter,
  signalFilter,
  setSignalFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  clearFilters,
  carriers,
  clients,
  regions
}) => {
  const activeFiltersCount = [
    clientFilter, 
    carrierFilter, 
    regionFilter, 
    signalFilter
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg flex items-center">
          <FilterIcon className="h-4 w-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge className="ml-2" variant="secondary">
              {activeFiltersCount}
            </Badge>
          )}
        </h3>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label>Período</Label>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger>
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {timeRange === 'custom' && (
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label>Intervalo personalizado</Label>
            <div className="flex gap-2 items-center">
              <DatePicker 
                date={startDate} 
                setDate={setStartDate} 
                placeholder="Data inicial" 
              />
              <span>até</span>
              <DatePicker 
                date={endDate} 
                setDate={setEndDate} 
                placeholder="Data final" 
              />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label>Agrupar por</Label>
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupByOption)}>
            <SelectTrigger>
              <SelectValue placeholder="Agrupar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CHIP">Chip</SelectItem>
              <SelectItem value="CLIENTE">Cliente</SelectItem>
              <SelectItem value="OPERADORA">Operadora</SelectItem>
              <SelectItem value="REGIAO">Região</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Cliente</Label>
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_clients">Todos os clientes</SelectItem>
              {clients.map(client => (
                <SelectItem key={client} value={client}>{client}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Operadora</Label>
          <Select value={carrierFilter} onValueChange={setCarrierFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as operadoras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_carriers">Todas as operadoras</SelectItem>
              {carriers.map(carrier => (
                <SelectItem key={carrier} value={carrier}>{carrier}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Região</Label>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as regiões" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_regions">Todas as regiões</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Qualidade do sinal</Label>
          <Select value={signalFilter} onValueChange={setSignalFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_signals">Todas</SelectItem>
              <SelectItem value="GOOD">Bom</SelectItem>
              <SelectItem value="UNSTABLE">Médio</SelectItem>
              <SelectItem value="POOR">Ruim</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
