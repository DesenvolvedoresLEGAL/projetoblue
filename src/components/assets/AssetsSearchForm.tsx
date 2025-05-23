
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
  const [inputError, setInputError] = useState('');
  
  // Inicializar o inputValue com o searchTerm ao montar o componente
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);
  
  // Função para validar entrada e detectar caracteres problemáticos
  const validateInput = (value: string): string => {
    if (!value) return '';
    
    // Lista de caracteres que podem causar problemas na query
    const problematicChars = /[(){}[\]\\^$.*+?|<>]/g;
    
    if (problematicChars.test(value)) {
      return 'Evite usar caracteres especiais como parênteses, chaves ou símbolos';
    }
    
    if (value.length > 50) {
      return 'Termo de busca muito longo. Máximo 50 caracteres';
    }
    
    return '';
  };
  
  // Função para lidar com mudanças no input com validação
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Valida entrada em tempo real
    const error = validateInput(value);
    setInputError(error);
    
    // Só atualiza searchTerm se não houver erro
    if (!error) {
      setSearchTerm(value);
    }
  };

  // Função melhorada para submissão do formulário
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valida antes de submeter
    const error = validateInput(inputValue);
    if (error) {
      setInputError(error);
      return;
    }
    
    setInputError('');
    setSearchTerm(inputValue);
    handleSearch(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por número, ICCID, rádio ou serial..."
          className={`pl-8 ${inputError ? 'border-red-500' : ''}`}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={() => {
            // Aplica a busca quando o campo perde o foco, se não houver erro
            if (!inputError && inputValue !== searchTerm) {
              setSearchTerm(inputValue);
            }
          }}
        />
        
        {/* Mostra erro de validação se houver */}
        {inputError && (
          <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 z-10">
            {inputError}
          </div>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute right-2.5 top-2.5">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs max-w-xs">
                A busca funciona em: número da linha, ICCID, rádio, número de série e modelo.
                <br />
                <span className="text-muted-foreground">
                  Evite caracteres especiais para melhores resultados.
                </span>
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
        
        <Button 
          type="submit" 
          disabled={!!inputError}
          className={inputError ? 'opacity-50 cursor-not-allowed' : ''}
        >
          Buscar
        </Button>
      </div>
    </form>
  );
};

export default AssetsSearchForm;
