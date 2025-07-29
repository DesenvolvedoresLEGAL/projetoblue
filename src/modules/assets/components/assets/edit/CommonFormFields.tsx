
import React, { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssetSolution, Manufacturer } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';
import { capitalize } from '@/utils/stringUtils';

interface CommonFormFieldsProps {
  formData: {
    status_id?: number;
    manufacturer_id?: number;
    solution_id: number;
  };
  isChip: boolean;
  manufacturers: Manufacturer[];
  handleStatusChange: (value: string) => void;
  handleManufacturerChange: (value: string) => void;
  handleSolutionChange: (value: string) => void;
}

const CommonFormFields = ({ 
  formData, 
  isChip, 
  handleStatusChange, 
  handleManufacturerChange, 
  handleSolutionChange,
  manufacturers 
}: CommonFormFieldsProps) => {

  const [solutions, setSolutions] = useState<AssetSolution[]>([]);

  useEffect(() => {
    const fetchSolutions = async () => {
        const {data, error: solutionsError} = await supabase
        .from('asset_solutions')
        .select('*')
        .order('solution');

      if(solutionsError) throw new Error('Não foram encontradas as soluções da LEGAL.');

      const mappedSolutions = data.map(s => ({
        id: s.id, // bigint NOT NULL
        solution: s.solution, // text NOT NULL
        created_at: s.created_at, // timestamp NOT NULL
        updated_at: s.updated_at, // timestamp NOT NULL
        deleted_at: s.deleted_at  // timestamp nullable
      }));

      setSolutions(mappedSolutions);
    }

    fetchSolutions();
  }, []);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="status_id">Status</Label>
        <Select
          value={formData.status_id?.toString()}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">DISPONÍVEL</SelectItem>
            <SelectItem value="2">ALUGADO</SelectItem>
            <SelectItem value="3">ASSINATURA</SelectItem>
            <SelectItem value="4">SEM DADOS</SelectItem>
            <SelectItem value="5">BLOQUEADO</SelectItem>
            <SelectItem value="6">MANUTENÇÃO</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="solution_id">Solução</Label>
        <Select
          value={formData.solution_id?.toString()}
          onValueChange={handleSolutionChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o tipo de solução" />
          </SelectTrigger>
          <SelectContent>
            {solutions.map(solution => (
              <SelectItem key={solution.id} value={solution.id.toString()}>
                { solution.solution }
              </SelectItem>
            ))}            
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="manufacturer_id">{isChip ? 'Operadora' : 'Fabricante'}</Label>
        <Select
          value={formData.manufacturer_id?.toString()}
          onValueChange={handleManufacturerChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Selecione ${isChip ? 'uma operadora' : 'um fabricante'}`} />
          </SelectTrigger>
          <SelectContent>
            {isChip ? manufacturers.filter(m => m.description.toLowerCase() === "operadora").map(manufacturer => (
              <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                { manufacturer.name }
              </SelectItem>
            )) : 
            manufacturers.filter(m => m.description.toLowerCase() !== "operadora").map(manufacturer => (
              <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                { manufacturer.name }
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default CommonFormFields;
