
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CommonFormFieldsProps {
  formData: {
    status_id?: number;
    manufacturer_id?: number;
  };
  isChip: boolean;
  handleStatusChange: (value: string) => void;
  handleManufacturerChange: (value: string) => void;
  manufacturers: { id: number; name: string }[];
}

const CommonFormFields = ({ 
  formData, 
  isChip, 
  handleStatusChange, 
  handleManufacturerChange, 
  manufacturers 
}: CommonFormFieldsProps) => {
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
        <Label htmlFor="manufacturer_id">{isChip ? 'Operadora' : 'Fabricante'}</Label>
        <Select
          value={formData.manufacturer_id?.toString()}
          onValueChange={handleManufacturerChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Selecione ${isChip ? 'uma operadora' : 'um fabricante'}`} />
          </SelectTrigger>
          <SelectContent>
            {manufacturers.map(manufacturer => (
              <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                {manufacturer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default CommonFormFields;
