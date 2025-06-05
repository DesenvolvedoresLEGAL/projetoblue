
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChipEditFormProps {
  formData: {
    iccid?: string;
    line_number?: string;
    plan_id?: number;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePlanChange: (value: string) => void;
  plans: { id: number; nome: string }[];
}

const ChipEditForm = ({ formData, handleChange, handlePlanChange, plans }: ChipEditFormProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="iccid">ICCID</Label>
        <Input
          id="iccid"
          name="iccid"
          value={formData.iccid || ''}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="line_number">Número da Linha</Label>
        <Input
          id="line_number"
          name="line_number"
          value={formData.line_number || ''}
          onChange={handleChange}
          type="number"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="plan_id">Plano</Label>
        <Select
          value={formData.plan_id?.toString()}
          onValueChange={handlePlanChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um plano" />
          </SelectTrigger>
          <SelectContent>
            {plans.map(plan => (
              <SelectItem key={plan.id} value={plan.id.toString()}>
                {plan.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default ChipEditForm;
