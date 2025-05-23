
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter, Info } from "lucide-react";
import { useAssetSolutions } from '@/hooks/useAssetSolutions';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const { data: assetSolutions = [] } = useAssetSolutions();
  const [inputValue, setInputValue] = useState(searchTerm);
  
  // Inicializar o inputValue com o searchTerm ao montar o componente
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);
  
  // Função para lidar com mudanças no input sem atualizar searchTerm imediatamente
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar ativos..."
          className="pl-8"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={() => setSearchTerm(inputValue)} 
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute right-2.5 top-2.5">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">
                A busca abrange: número da linha, ICCID, rádio, número de série e modelo
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex gap-2">
        <Select value={filterType} onValueChange={(value) => handleFilterChange('type', value)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Tipos</SelectItem>
            {assetSolutions.map((solution) => (
              <SelectItem key={solution.id} value={solution.id.toString()}>
                {solution.solution}
              </SelectItem>
            ))}
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
          </SelectContent>
        </Select>
        
        <Button type="submit">Buscar</Button>
      </div>
    </form>
  );
};

export default AssetsSearchForm;
