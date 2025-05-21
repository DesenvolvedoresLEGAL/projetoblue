
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface AssetsSearchFormProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: string;
  filterStatus: string;
  handleSearch: (e: React.FormEvent) => void;
  handleFilterChange: (type: string, value: string) => void;
}

const AssetsSearchForm = ({
  searchTerm,
  setSearchTerm,
  filterType,
  filterStatus,
  handleSearch,
  handleFilterChange
}: AssetsSearchFormProps) => {
  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar ativos..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Select value={filterType} onValueChange={(value) => handleFilterChange('type', value)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Tipos</SelectItem>
            <SelectItem value="chip">Chip</SelectItem>
            <SelectItem value="router">Roteador</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="disponível">Disponível</SelectItem>
            <SelectItem value="em locação">Alugado</SelectItem>
            <SelectItem value="em assinatura">Assinatura</SelectItem>
            <SelectItem value="sem dados">Sem Dados</SelectItem>
            <SelectItem value="bloqueado">Bloqueado</SelectItem>
            <SelectItem value="em manutenção">Manutenção</SelectItem>
            <SelectItem value="extraviado">Extraviado</SelectItem>
          </SelectContent>
        </Select>
        
        <Button type="submit">Buscar</Button>
      </div>
    </form>
  );
};

export default AssetsSearchForm;
