
import { useState } from "react";
import { Search, Filter, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusRecord } from "@/types/asset";
import { useAssetSolutions } from "@modules/assets/hooks/useAssetSolutions";

interface InventoryFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  phoneSearch: string;
  setPhoneSearch: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  statusRecords: StatusRecord[];
  clearFilters: () => void;
}

const InventoryFilters = ({
  search,
  setSearch,
  phoneSearch,
  setPhoneSearch,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  statusRecords,
  clearFilters
}: InventoryFiltersProps) => {
  // Get asset solutions dynamically from the API
  const { data: assetSolutions = [] } = useAssetSolutions();

  // Helper function to map status names to filter values
  function mapStatusToFilter(statusName: string): string {
    switch (statusName) {
      case 'Disponível': return 'DISPONÍVEL';
      case 'Alugado': return 'ALUGADO';
      case 'Assinatura': return 'ASSINATURA';
      case 'Sem dados': return 'SEM DADOS';
      case 'Bloqueado': return 'BLOQUEADO';
      case 'Em manutenção': return 'MANUTENÇÃO';
      default: return statusName.toUpperCase();
    }
  }

  // Check if the current filter is for CHIP solution
  const isChipFilter = assetSolutions.some(
    solution => solution.solution === "CHIP" && typeFilter === solution.solution
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar ativo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Tipo de Ativo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {assetSolutions.map((solution) => (
                <SelectItem key={solution.id} value={solution.solution}>
                  {solution.solution}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {statusRecords.map((status) => (
                <SelectItem key={status.id} value={mapStatusToFilter(status.status)}>
                  {status.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Phone number search for chips - only show when filter type is CHIP or all */}
        {(typeFilter === "all" || typeFilter === "CHIP" || isChipFilter) && (
          <div className="relative max-w-md">
            <Smartphone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por número do chip (com ou sem DDD)..."
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryFilters;
