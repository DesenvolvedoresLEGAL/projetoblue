
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { formatPhoneNumber } from '@/utils/phoneFormatter';

interface PhoneFieldsProps {
  phones: string[];
  onAddPhone: () => void;
  onRemovePhone: (index: number) => void;
  onUpdatePhone: (index: number, value: string) => void;
}

export const PhoneFields: React.FC<PhoneFieldsProps> = ({
  phones,
  onAddPhone,
  onRemovePhone,
  onUpdatePhone
}) => {
  const handlePhoneChange = (index: number, value: string) => {
    // Remove formatação para validação e armazenamento
    const cleanValue = value.replace(/\D/g, '');
    // Aplica formatação apenas para exibição
    const formattedValue = formatPhoneNumber(cleanValue);
    onUpdatePhone(index, formattedValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-neue-haas font-bold text-[#020CBC]">
          Telefones *
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddPhone}
          className="text-[#4D2BFB] border-[#4D2BFB]"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>
      {phones.map((telefone, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={telefone}
            onChange={(e) => handlePhoneChange(index, e.target.value)}
            placeholder="(11) 99999-9999"
            className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
            required={index === 0}
            maxLength={15}
          />
          {phones.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemovePhone(index)}
              className="text-red-500 border-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
