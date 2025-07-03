
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Settings, Calendar } from "lucide-react";

export interface AssociationGeneralConfig {
  associationType: number; // Mudado para number (1 = ALUGUEL, 2 = ASSINATURA)
  startDate: Date;
  endDate?: Date;
  notes: string;
  rentedDays?: number; // Adicionado campo faltante
}

interface AssociationGeneralConfigProps {
  config: AssociationGeneralConfig;
  onUpdate: (updates: Partial<AssociationGeneralConfig>) => void;
}

export const AssociationGeneralConfigComponent: React.FC<AssociationGeneralConfigProps> = ({
  config,
  onUpdate
}) => {
  // Validação de datas
  const isEndDateValid = !config.endDate || config.endDate >= config.startDate;

  const handleAssociationTypeChange = (value: string) => {
    // Mapear string para número
    const numericValue = value === 'ALUGUEL' ? 1 : 2;
    if (import.meta.env.DEV) console.log('🔄 AssociationGeneralConfig - Type changed to:', value, '-> ID:', numericValue);
    onUpdate({ associationType: numericValue });
  };

  // Converter número de volta para string para exibição
  const getDisplayValue = (numericType: number): string => {
    return numericType === 1 ? 'ALUGUEL' : 'ASSINATURA';
  };

  return (
    <Card className="border-[#4D2BFB]/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-[#03F9FF]" />
          Configuração da Associação
        </CardTitle>
        <CardDescription>
          Configure os detalhes gerais desta associação (aplicados a todos os ativos)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de Associação */}
          <div className="space-y-2">
            <Label htmlFor="association-type" className="text-sm">Tipo de Associação *</Label>
            <Select 
              value={getDisplayValue(config.associationType)} 
              onValueChange={handleAssociationTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                <SelectItem value="ASSINATURA">Assinatura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data de Início */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Data de Início *
            </Label>
            <DatePicker
              date={config.startDate}
              setDate={(date) => onUpdate({ startDate: date || new Date() })}
              placeholder="Selecionar data de início"
            />
          </div>

          {/* Data de Fim */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Data de Fim
            </Label>
            <div className="md:w-1/2">
              <DatePicker
                date={config.endDate}
                setDate={(date) => onUpdate({ endDate: date })}
                placeholder="Selecionar data de fim (opcional)"
              />
              {!isEndDateValid && (
                <p className="text-xs text-red-500 mt-1">
                  A data de fim deve ser posterior à data de início
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Observações Gerais */}
        <div className="space-y-2">
          <Label htmlFor="general-notes" className="text-sm">Observações Gerais</Label>
          <Textarea
            id="general-notes"
            value={config.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Observações gerais sobre esta associação..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};
